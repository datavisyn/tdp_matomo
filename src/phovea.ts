/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
import {IRegistry} from 'phovea_core/src/plugin';
import {EP_PHOVEA_CORE_LOGIN, EP_PHOVEA_CORE_LOGOUT} from 'phovea_core/src/extensions';
import {EP_PHOVEA_CLUE_PROVENANCE_GRAPH} from 'phovea_clue/src/extensions';

export default function (registry: IRegistry) {

  registry.push(EP_PHOVEA_CORE_LOGIN, 'matomoLogin', () => System.import('./matomo'), {
    factory: 'trackLogin'
  });

  registry.push(EP_PHOVEA_CORE_LOGOUT, 'matomoLogout', () => System.import('./matomo'), {
    factory: 'trackLogout'
  });

  registry.push(EP_PHOVEA_CLUE_PROVENANCE_GRAPH, 'matomoAnalytics', () => System.import('./matomo'), {
    factory: 'trackProvenance'
  });

}
