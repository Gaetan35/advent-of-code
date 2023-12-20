import * as fs from "fs/promises";

const parseTextInput = async (isTest = false) => {
  const modules = {};
  (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n")
    .forEach((line) => {
      const [module, destinationsString] = line.split(" -> ");
      const destinations = destinationsString.split(", ");
      let type = "broadcaster";
      let name = "broadcaster";
      if (module[0] === "&" || module[0] === "%") {
        type = module[0];
        name = module.substring(1);
      }
      modules[name] = { type, destinations, name };
      if (type === "&") {
        modules[name].sources = {};
      }
      if (type === "%") {
        modules[name].state = "off";
      }
    });

  for (const { destinations, name } of Object.values(modules)) {
    for (const destination of destinations) {
      if (modules[destination]?.type === "&") {
        modules[destination].sources[name] = "low";
      }
    }
  }
  return modules;
};

const pressButton = (modules, iterations) => {
  const pulseCounts = { high: 0, low: 0 };
  for (let i = 0; i < iterations; i++) {
    if (i % 100000 === 0) {
      // console.log("iteration:", i);
    }
    const pulses = [{ target: "broadcaster", type: "low", source: "button" }];
    while (pulses.length > 0) {
      const pulse = pulses.shift();
      // console.log(pulse);
      pulseCounts[pulse.type] += 1;

      const module = modules[pulse.target];
      if (!module) {
        continue;
      }

      if (module.type === "broadcaster") {
        pulses.push(
          ...module.destinations.map((target) => ({
            target,
            type: pulse.type,
            source: module.name,
          }))
        );
      }

      if (module.type === "%" && pulse.type === "low") {
        module.state = module.state === "on" ? "off" : "on";
        pulses.push(
          ...module.destinations.map((target) => ({
            target,
            type: module.state === "off" ? "low" : "high",
            source: module.name,
          }))
        );
      }

      if (module.type === "&") {
        module.sources[pulse.source] = pulse.type;
        let pulseTypeToSend = "low";
        for (const source of Object.keys(module.sources)) {
          if (module.sources[source] === "low") {
            pulseTypeToSend = "high";
            break;
          }
        }
        pulses.push(
          ...module.destinations.map((target) => ({
            target,
            type: pulseTypeToSend,
            source: module.name,
          }))
        );
      }

      if (
        pulse.target === "sq" &&
        pulse.source === "fv" &&
        pulse.type === "high"
      ) {
        console.log(`${i + 1}: ${pulse.type} pulse sent from ${pulse.source}`);
        // console.dir(modules["sq"].sources, { depth: null });
      }
    }
    // console.dir(modules["sq"].sources, { depth: null });
  }
  return pulseCounts;
};

const modules = await parseTextInput(false);

console.log(modules["sq"].sources);

const result = pressButton(modules, 100000);
console.log(result);
const { high, low } = result;
console.log("Result : ", high * low);

// xr: 3769
// vt: 3797
// kk: 3931
// fv: 3863
