/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
import {IRegistry} from 'phovea_core';

// TODO: Use these constants for extension types below. Waiting for `tdp_core` to point to `phovea_clue` develop branch again (see https://github.com/datavisyn/tdp_core/blob/develop/package.json#L82).
// import {EP_PHOVEA_CORE_LOGIN, EP_PHOVEA_CORE_LOGOUT} from 'phovea_core/src/extensions';
// import {EP_PHOVEA_CLUE_PROVENANCE_GRAPH} from 'phovea_clue/src/extensions';

export default function (registry: IRegistry) {

  registry.push('epPhoveaCoreLogin', 'matomoLogin', () => import('./app/Matomo'), {
    factory: 'trackLogin'
  });

  registry.push('epPhoveaCoreLogout', 'matomoLogout', () => import('./app/Matomo'), {
    factory: 'trackLogout'
  });

  registry.push('epPhoveaClueProvenanceGraph', 'matomoAnalytics', () => import('./app/Matomo'), {
    factory: 'trackProvenance'
  });

}
