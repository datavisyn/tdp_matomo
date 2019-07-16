import {on} from 'phovea_core/src/event';
import {GLOBAL_EVENT_USER_LOGGED_IN, IUser, GLOBAL_EVENT_USER_LOGGED_OUT} from 'phovea_core/src/security';
import {ProvenanceGraph, ActionNode} from 'phovea_core/src/provenance';
import {getAPIJSON} from 'phovea_core/src/ajax';
import ATDPApplication from 'tdp_core/src/ATDPApplication';
import {trackableActions} from './actions';

/**
 * Trackable Matomo event
 */
export interface IMatomoEvent {
  category: string;
  action: string;
  name?: (node: ActionNode) => string | string;
  value?: (node: ActionNode) => number | number;
}

/**
 * Trackable action
 */
export interface ITrackableAction {
  /**
   * phovea extension id
   */
  id: string;
  /**
   * matomo event
   */
  event: IMatomoEvent;
}

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

function trackGraph(graph: ProvenanceGraph, trackableActions: Map<string, IMatomoEvent>) {
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

export function trackApp(tdpApp: ATDPApplication<any>, customActions?: {id: string, event: IMatomoEvent}[]): Promise<boolean> {
  // merge custom actions into trackable actions
  if(customActions && customActions.length > 0) {
    customActions.forEach((action) => trackableActions.set(action.id, action.event));
  }

  const matomoConfig = getAPIJSON('/tdp/config/matomo');

  tdpApp.on(ATDPApplication.EVENT_OPEN_START_MENU, () => matomo.trackEvent('startMenu', 'open', 'Open start menu'));

  on(GLOBAL_EVENT_USER_LOGGED_IN, (_, user: IUser) => {
    matomo.login(user.name);
    tdpApp.graph.then((graph) => {
      if (graph.isEmpty) {
        matomo.trackEvent('session', 'new', 'New Session');
      } else {
        matomo.trackEvent('session', 'continue', `${graph.desc.id} at state ${tdpApp.clueManager.storedState || Math.max(...graph.states.map((s) => s.id))}`);
      }

      matomoConfig.then((config: IPhoveaMatomoConfig) => {
        trackGraph(graph, trackableActions);
      });
    });
  });

  on(GLOBAL_EVENT_USER_LOGGED_OUT, () => {
    matomo.logout();
  });

  return matomoConfig.then((config: IPhoveaMatomoConfig) => initMamoto(config));
}
