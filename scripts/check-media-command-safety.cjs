const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const hostileName = 'video & echo INJECTED; $(whoami).mp4';
for (const file of ['sample-frames.js', 'inspect-media.js', 'extract-preview-samples.js', 'extract-all-videos.js']) {
  const calls = [];
  const childProcess = {
    execFileSync(command, args, options = {}) {
      assert.ok(['ffmpeg', 'ffprobe'].includes(command));
      assert.ok(Array.isArray(args) && args.every(arg => typeof arg === 'string'));
      assert.ok(!options.shell, 'Media tools must not run through a shell');
      calls.push(args);
      return JSON.stringify({ streams: [{ codec_name: 'h264' }] });
    },
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, file), 'utf8'), {
    __dirname,
    console: { log() {}, error() {} },
    require(name) {
      if (name === 'child_process') return childProcess;
      if (name === 'path') return path;
      if (name === 'fs') return {
        existsSync: () => true,
        mkdirSync() {},
        readdirSync: () => [hostileName],
      };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  }, { filename: file });
  assert.ok(calls.length > 0, `${file} must invoke the shell-free tool`);
  if (file === 'inspect-media.js') {
    assert.ok(calls[0].at(-1).endsWith(hostileName), 'Keep the filename as one literal argument');
  }
}
assert.doesNotMatch(fs.readFileSync(path.join(__dirname, 'generate_cinematic_walk_flow.py'), 'utf8'), /shell\s*=\s*True/);
console.log('Media command safety checks passed.');
