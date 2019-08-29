import {IUser} from 'phovea_core/src/security';
import {ProvenanceGraph, ActionNode} from 'phovea_core/src/provenance';
import {getAPIJSON} from 'phovea_core/src/ajax';
import {list} from 'phovea_core/src/plugin';

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

class Matomo {

  init(config: IPhoveaMatomoConfig) {
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
  }

  trackEvent(category: string, action: string, name?: string, value?: number) {
    const t: any[] = ['trackEvent', category, action];
    if (typeof name === 'string') {
      t.push(name);
    }
    if (typeof value === 'number') {
      t.push(value);
    }
    _paq.push(t);
  }

  login(user: string) {
    _paq.push(['setUserId', user]);
    // _paq.push(['requireConsent']); TODO user consent form with opt out
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);
    // enable correct measuring of the site since it is a single page site
    _paq.push(['enableHeartBeatTimer']);
  }

  logout() {
    _paq.push(['resetUserId']);
    _paq.push(['trackPageView']);
  }
}

const matomo = new Matomo();

/**
 * Login extension point
 */
export function trackLogin(user: IUser) {
  matomo.login(user.name);
}

/**
 * Logout extension point
 */
export function trackLogout() {
  matomo.logout();
}

/**
 * Provenance graph extension point
 * @param graph ProvenanceGraph
 */
export async function trackProvenance(graph: ProvenanceGraph) {
  if (graph.isEmpty) {
    matomo.trackEvent('session', 'new', 'New Session');
  } else {
    matomo.trackEvent('session', 'continue', `${graph.desc.id} at state ${Math.max(...graph.states.map((s) => s.id))}`);
  }

  const trackableActions = new Map<string, IMatomoEvent>();

  // load all registered actionFunction extension points and look if they contain a `tdp_matomo` property
  list((desc) => desc.type === 'actionFunction' && desc.tdp_matomo)
    .forEach((desc) => {
      // if(desc.tdp_matomo)
      trackableActions.set(desc.id, desc.tdp_matomo);
    });

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
    matomo.trackEvent('provenance', 'runChain', 'Run actions in chain', nodes.length);
  });

  const config: IPhoveaMatomoConfig = await getAPIJSON('/tdp/config/matomo');
  matomo.init(config);
}
