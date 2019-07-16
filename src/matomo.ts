import {on} from 'phovea_core/src/event';
import {GLOBAL_EVENT_USER_LOGGED_IN, IUser, GLOBAL_EVENT_USER_LOGGED_OUT} from 'phovea_core/src/security';
import Ordino from 'ordino/src/Ordino';
import {SESSION_KEY_NEW_ENTRY_POINT} from 'ordino/src/internal/constants';
import * as session from 'phovea_core/src/session';
import {ProvenanceGraph, ActionNode} from 'phovea_core/src/provenance';
import {getAPIJSON} from 'phovea_core/src/ajax';
import parseRange from 'phovea_core/src/range/parser';
import ATDPApplication from 'tdp_core/src/ATDPApplication';

/**
 * Trackable Matomo event
 */
interface IMatomoEvent {
  category: string;
  action: string;
  name?: (node: ActionNode) => string | string;
  value?: (node: ActionNode) => number | number;
}

/**
 * Map of trackable actions
 * key = phovea extension id
 */
const trackableActions = new Map<string, IMatomoEvent>();

// custom event
trackableActions.set('runChain', {category:'provenance', action: 'runChain'});

// from tdp_core\src\internal\cmds.ts
trackableActions.set('tdpInitSession', {category:'session', action: 'init'});
trackableActions.set('tdpSetParameter', {category:'view', action: 'setParameter'});

// from tdp_core\src\lineup\internal\scorecmds.ts
trackableActions.set('tdpAddScore', {category:'score', action: 'add'});
trackableActions.set('tdpRemoveScore', {category:'score', action: 'remove'});

// from ordino\src\internal\cmds.ts
trackableActions.set('targidCreateView', {category:'view', action: 'create'});
trackableActions.set('targidRemoveView', {category:'view', action: 'remove'});
trackableActions.set('targidReplaceView', {category:'view', action: 'replace'});
trackableActions.set('targidSetSelection', {category:'view', action: 'setSelection', value: (node) => parseRange(node.parameter.range).dim(0).length});

// from tdp_core\src\lineup\internal\cmds.ts
trackableActions.set('lineupSetRankingSortCriteria', {category:'lineup', action: 'setRankingSortCriteria'});
trackableActions.set('lineupSetSortCriteria', {category:'lineup', action: 'setRankingSortCriteria'});
trackableActions.set('lineupSetGroupCriteria', {category:'lineup', action: 'setGroupCriteria'});
trackableActions.set('lineupAddRanking', {category:'lineup', action: 'addRanking'});
trackableActions.set('lineupSetColumn', {category:'lineup', action: 'setColumn'});
trackableActions.set('lineupAddColumn', {category:'lineup', action: 'addColumn'});
trackableActions.set('lineupMoveColumn', {category:'lineup', action: 'moveColumn'});

// assume `_pag` is already declared
(<any>window)._paq = (<any>window)._paq || [];
declare const _paq: any[][];

interface IPhoveaMatomoConfig {
  /**
   * URL to Matomo backend with with a trailing slash
   * Use `null` to disables the tracking
   */
  url?: string;

  /**
   * ID of the Matomo site (generated when creating a page)
   */
  site: string;
}

const matomo = {
  trackEvent(category: string, action: string, name?: string, value?: number) {
    const t: any[] = ['trackEvent', category, action];
    if (typeof name === 'string') {
      t.push(name);
    }
    if (typeof value === 'number') {
      t.push(value);
    }
    _paq.push(t);
  },
  login(user: string) {
    _paq.push(['setUserId', user]);
    // _paq.push(['requireConsent']); TODO user consent form with opt out
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);
    // enable correct measuring of the site since it is a single page site
    _paq.push(['enableHeartBeatTimer']);
  },
  logout() {
    _paq.push(['resetUserId']);
    _paq.push(['trackPageView']);
  }
};

function trackGraph(graph: ProvenanceGraph) {
  graph.on('execute', (_, node: ActionNode) => {
    if(!Array.from(trackableActions.keys()).includes(node.getAttr('f_id'))) {
      return;
    }
    const event = trackableActions.get(node.getAttr('f_id'));
    matomo.trackEvent(
      event.category,
      event.action,
      (typeof event.name === 'function') ? event.name(node) : node.name,
      (typeof event.value === 'function') ? event.value(node) : null
    );
  });
  graph.on('run_chain', (_, nodes: ActionNode[]) => {
    const event = trackableActions.get('runChain');
    matomo.trackEvent(event.category, event.action, 'Run actions in chain', nodes.length);
  });
}

function initMamoto(config: IPhoveaMatomoConfig): boolean {
  if (!config.url) {
    return false;
  }
  _paq.push(['setTrackerUrl', `${config.url}matomo.php`]);
  _paq.push(['setSiteId', config.site]);

  const s = document.createElement('script');
  s.type = 'text/javascript';
  s.async = true;
  s.defer = true;
  s.src = `${config.url}matomo.js`;
  const base = document.getElementsByTagName('script')[0];
  base.insertAdjacentElement('beforebegin', s);
  return true;
}

export function trackApp(tdpApp: ATDPApplication<any>): Promise<boolean> {
  const matomoConfig = getAPIJSON('/tdp/config/matomo');

  tdpApp.on(Ordino.EVENT_OPEN_START_MENU, () => matomo.trackEvent('startMenu', 'open', 'Open start menu'));

  const sessionInit: {view: string, options: any} = <any>session.retrieve(SESSION_KEY_NEW_ENTRY_POINT);

  on(GLOBAL_EVENT_USER_LOGGED_IN, (_, user: IUser) => {
    matomo.login(user.name);
    tdpApp.graph.then((graph) => {
      if (graph.isEmpty && !sessionInit) {
        matomo.trackEvent('session', 'new', 'New Session');
      } else if (sessionInit) {
        // matomo.trackEvent('session', 'init', `Initialize ${sessionInit.view}`);//, JSON.stringify(sessionInit.options));
      } else {
        matomo.trackEvent('session', 'continue', `${graph.desc.id} at state ${tdpApp.clueManager.storedState || Math.max(...graph.states.map((s) => s.id))}`);
      }

      matomoConfig.then((config: IPhoveaMatomoConfig) => {
        trackGraph(graph);
      });
    });
  });

  on(GLOBAL_EVENT_USER_LOGGED_OUT, () => {
    matomo.logout();
  });

  return matomoConfig.then((config: IPhoveaMatomoConfig) => initMamoto(config));
}
