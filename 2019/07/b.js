const utils = require('../utils');

class Amp {
   constructor(phase, program) {
    this.phase = phase;
    this.program = program;
    this.position = 0;
    this.output = undefined;
    this.hasOutputed = false;
  }

  isFinished = () => (this.position > this.program.length);

  getValueFromOpcode = (n, mode) => (mode === 0 ? this.program[this.program[n]] : this.program[n]);

  doOp() {
    const instruction = this.program[this.position];
    const op = utils.getNumberAtPosition(instruction, 1) + utils.getNumberAtPosition(instruction, 2) * 10;
    const o1mode  = utils.getNumberAtPosition(instruction, 3);
    const o2mode  = utils.getNumberAtPosition(instruction, 4);
    const o1 = this.getValueFromOpcode(this.position + 1, o1mode);
    const o2 = this.getValueFromOpcode(this.position + 2, o2mode);
    const o3 = this.getValueFromOpcode(this.position + 3, 1);
    
    switch (op) {
      case 1:
        this.program[o3] = o2 + o1;
        this.position += 4;
        break;
      case 2: 
        this.program[o3] = o2 * o1;
        this.position += 4;
        break;
      case 3:
        if (this.phase) {
          this.program[this.getValueFromOpcode(this.position + 1, 1)] = this.phase;
          this.phase = undefined;
        } else {
          this.program[this.getValueFromOpcode(this.position + 1, 1)] = this.input;
          this.input = undefined;
        }
        this.position += 2;
        break;
      case 4:
        this.output = o1;
        this.position += 2;
        this.hasOutputed = true;
        break;
      case 5:
        this.position = o1 !== 0 ? o2 : this.position + 3;
        break;
      case 6: 
        this.position = o1 === 0 ? o2 : this.position + 3;
        break;
      case 7:
        this.program[o3] =  o1 < o2 ? 1 : 0;
        this.position += 4;
        break;
      case 8:
        this.program[o3] = (o1 === o2 ? 1 : 0);
        this.position += 4;
        break;
      case 99:
        this.position = 9999999999;
      default:
        break;
    }
  }
}

utils.rl.on("line",  function(line) {
  let maxOutput = 0;
  const program = line.split(",").map(v => parseInt(v));
  const key = [5, 6, 7, 8, 9];
  const permutations = utils.getPermutations(key);

  permutations.forEach((perm) => {
    const amps = perm.map((phase) => new Amp(phase,  program.slice()));
    amps[0].input = 0;
    for(let i = 0; !amps[key.length -1].isFinished(); i = (i + 1) % key.length) {
      while (!amps[i].isFinished() && !amps[i].hasOutputed) amps[i].doOp();
      amps[(i + 1) % key.length].input = amps[i].output;
      amps[i].hasOutputed = false;
    }
    if (amps[key.length -1].output > maxOutput) maxOutput = amps[key.length -1].output;
  });
  console.log(maxOutput)
});
