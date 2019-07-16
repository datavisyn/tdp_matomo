import {IMatomoEvent} from './matomo';

/**
 * Map of trackable actions
 * key = phovea extension id
 */
export const trackableActions = new Map<string, IMatomoEvent>();

// custom event
trackableActions.set('runChain', {category:'provenance', action: 'runChain'});

// from tdp_core\src\internal\cmds.ts
trackableActions.set('tdpInitSession', {category:'session', action: 'init'});
trackableActions.set('tdpSetParameter', {category:'view', action: 'setParameter'});

// from tdp_core\src\lineup\internal\scorecmds.ts
trackableActions.set('tdpAddScore', {category:'score', action: 'add'});
trackableActions.set('tdpRemoveScore', {category:'score', action: 'remove'});

// from tdp_core\src\lineup\internal\cmds.ts
trackableActions.set('lineupSetRankingSortCriteria', {category:'lineup', action: 'setRankingSortCriteria'});
trackableActions.set('lineupSetSortCriteria', {category:'lineup', action: 'setRankingSortCriteria'});
trackableActions.set('lineupSetGroupCriteria', {category:'lineup', action: 'setGroupCriteria'});
trackableActions.set('lineupAddRanking', {category:'lineup', action: 'addRanking'});
trackableActions.set('lineupSetColumn', {category:'lineup', action: 'setColumn'});
trackableActions.set('lineupAddColumn', {category:'lineup', action: 'addColumn'});
trackableActions.set('lineupMoveColumn', {category:'lineup', action: 'moveColumn'});
