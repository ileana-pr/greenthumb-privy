import { logger, type IAgentRuntime, type Project, type ProjectAgent } from '@elizaos/core';
import { character as greenthumb } from './greenthumb';
import starterPlugin from './plugin';

const initCharacter = ({ runtime }: { runtime: IAgentRuntime }) => {
  logger.info('Initializing character');
  logger.info('Name: ', greenthumb.name);
};

export const projectAgent: ProjectAgent = {
  character: greenthumb,
  init: async (runtime: IAgentRuntime) => await initCharacter({ runtime }),
  plugins: [starterPlugin], // custom plugins loaded here
};

const project: Project = {
  agents: [projectAgent],
};

export { testSuites } from './__tests__/e2e';
export { character } from './greenthumb';

export default project;
