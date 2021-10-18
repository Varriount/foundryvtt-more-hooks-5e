import { MODULE_NAME } from "../const.js";
import { socket } from '../../setup.js';
import { prepareOptions, getCommonArguments } from "../utils.js";

export function patchRollToolCheck() {
  libWrapper.register(MODULE_NAME, 'CONFIG.Item.documentClass.prototype.rollToolCheck', rollToolCheckPatch, "WRAPPER");
}

async function rollToolCheckPatch(wrapper, options, ...rest) {
  const result = await wrapper(options, ...rest);

  const itemUuid = this.uuid;
  const actorUuid = this.actor?.uuid;
  const cleanedOptions = prepareOptions(options);

  socket.executeForEveryone(rollToolCheck, itemUuid, result, cleanedOptions, actorUuid, getCommonArguments);

  return result;
}

/**
 * A hook event that fires after an Item rolls a Tool Check
 * @param {Item5e} item       The Item that rolls the Tool Check
 * @param {D20Roll} result           The Result of the Tool Check Roll
 * @param {object} [options]      Roll options which were provided to the d20Roll function
 * @param {Actor5e} [actor]       The Actor that owns the item
 * @param {CommonArguments} commonArgs   A set of common arguments for utility
 */
export async function rollToolCheck(itemUuid, result, cleanedConfig, actorUuid, commonArgs) {

  const item = await fromUuid(itemUuid);

  const actorOrToken = await fromUuid(actorUuid);
  const actor = actorOrToken instanceof TokenDocument ? actorOrToken.actor : actorOrToken;

  const resultRoll = game.dnd5e.dice.D20Roll.fromData(result);
  Hooks.callAll('Item5e.rollToolCheck', item, resultRoll, cleanedConfig, actor, commonArgs);
}
