# Tether PM2
Tether agent that emits basic on/off state messages based on a schedule that can be edited via an exposed browser UI.  
Other agents can listen to these messages to start and stop operation, or in suitable cases it can be used in tandem with the [Tether PM2 agent](https://github.com/RandomStudio/tether-pm2) to start and stop processes altogether.  

## Configuration
JSDoc annotations for the main Config object can be found in [Config type def](./src/server/config/types.ts)

## Plugs
See [AsyncAPI YAML](./tether.yml)

## Setup
Install dependencies with:
```
npm i
```
Build the agent with:
```
npm run build
```
Build and run the agent locally with:
```
npm start
```

## Command line arguments
Run this agent with command line arguments to override the default agent config.  
Beside the standard tether configuration options, the main two options that are important to provide are:
- `http.port`: The network port on which to expose the agent's browser-based UI. Defaults to `5555`.
- `emitInterval`: The amount of time between publication of on/off state messages, in milliseconds. Defaults to `5000`.
