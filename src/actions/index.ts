import { install } from './install';
import { uninstall } from './uninstall';

export const actions: Record<string, Action> = { install, uninstall };
