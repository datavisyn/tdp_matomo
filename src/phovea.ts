/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
import {IRegistry} from 'phovea_core/src/plugin';
import {PHOVEA_LOGIN, PHOVEA_LOGOUT} from 'phovea_core/src/extensions';
import {PHOVEA_PROVENANCE_GRAPH} from 'phovea_clue/src/extensions';

export default function (registry: IRegistry) {

  registry.push(PHOVEA_LOGIN, 'matomoLogin', () => System.import('./matomo'), {
    factory: 'trackLogin'
  });

  registry.push(PHOVEA_LOGOUT, 'matomoLogout', () => System.import('./matomo'), {
    factory: 'trackLogout'
  });

  registry.push(PHOVEA_PROVENANCE_GRAPH, 'matomoAnalytics', () => System.import('./matomo'), {
    factory: 'trackProvenance'
  });

}
