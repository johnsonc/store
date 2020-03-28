
/* IMPORT */

import areShallowEqual from 'are-shallow-equal';
import {record} from 'proxy-watcher';
import {EMPTY_ARRAY, SELECTOR_IDENTITY} from './consts';
import ChangesSubscribers from './changes_subscribers';
import Errors from './errors';
import Scheduler from './scheduler';
import Utils from './utils';
import {Disposer, Listener} from './types';

/* ON CHANGE */

function onChange<S1 extends object, S2 extends object, S3 extends object, S4 extends object, S5 extends object, S6 extends object, S7 extends object, S8 extends object, S9 extends object> ( stores: [S1, S2, S3, S4, S5, S6, S7, S8, S9], listener: Listener<[S1, S2, S3, S4, S5, S6, S7, S8, S9]> ): Disposer;
function onChange<S1 extends object, S2 extends object, S3 extends object, S4 extends object, S5 extends object, S6 extends object, S7 extends object, S8 extends object> ( stores: [S1, S2, S3, S4, S5, S6, S7, S8], listener: Listener<[S1, S2, S3, S4, S5, S6, S7, S8]> ): Disposer;
function onChange<S1 extends object, S2 extends object, S3 extends object, S4 extends object, S5 extends object, S6 extends object, S7 extends object> ( stores: [S1, S2, S3, S4, S5, S6, S7], listener: Listener<[S1, S2, S3, S4, S5, S6, S7]> ): Disposer;
function onChange<S1 extends object, S2 extends object, S3 extends object, S4 extends object, S5 extends object, S6 extends object> ( stores: [S1, S2, S3, S4, S5, S6], listener: Listener<[S1, S2, S3, S4, S5, S6]> ): Disposer;
function onChange<S1 extends object, S2 extends object, S3 extends object, S4 extends object, S5 extends object> ( stores: [S1, S2, S3, S4, S5], listener: Listener<[S1, S2, S3, S4, S5]> ): Disposer;
function onChange<S1 extends object, S2 extends object, S3 extends object, S4 extends object> ( stores: [S1, S2, S3, S4], listener: Listener<[S1, S2, S3, S4]> ): Disposer;
function onChange<S1 extends object, S2 extends object, S3 extends object> ( stores: [S1, S2, S3], listener: Listener<[S1, S2, S3]> ): Disposer;
function onChange<S1 extends object, S2 extends object> ( stores: [S1, S2], listener: Listener<[S1, S2]> ): Disposer;
function onChange<S1 extends object> ( store: S1, listener: Listener<[S1]> ): Disposer;
function onChange<S1 extends object, S2 extends object, S3 extends object, S4 extends object, S5 extends object, S6 extends object, S7 extends object, S8 extends object, S9 extends object, R> ( stores: [S1, S2, S3, S4, S5, S6, S7, S8, S9], selector: ( ...stores: [S1, S2, S3, S4, S5, S6, S7, S8, S9] ) => R, listener: Listener<[R]> ): Disposer;
function onChange<S1 extends object, S2 extends object, S3 extends object, S4 extends object, S5 extends object, S6 extends object, S7 extends object, S8 extends object, R> ( stores: [S1, S2, S3, S4, S5, S6, S7, S8], selector: ( ...stores: [S1, S2, S3, S4, S5, S6, S7, S8] ) => R, listener: Listener<[R]> ): Disposer;
function onChange<S1 extends object, S2 extends object, S3 extends object, S4 extends object, S5 extends object, S6 extends object, S7 extends object, R> ( stores: [S1, S2, S3, S4, S5, S6, S7], selector: ( ...stores: [S1, S2, S3, S4, S5, S6, S7] ) => R, listener: Listener<[R]> ): Disposer;
function onChange<S1 extends object, S2 extends object, S3 extends object, S4 extends object, S5 extends object, S6 extends object, R> ( stores: [S1, S2, S3, S4, S5, S6], selector: ( ...stores: [S1, S2, S3, S4, S5, S6] ) => R, listener: Listener<[R]> ): Disposer;
function onChange<S1 extends object, S2 extends object, S3 extends object, S4 extends object, S5 extends object, R> ( stores: [S1, S2, S3, S4, S5], selector: ( ...stores: [S1, S2, S3, S4, S5] ) => R, listener: Listener<[R]> ): Disposer;
function onChange<S1 extends object, S2 extends object, S3 extends object, S4 extends object, R> ( stores: [S1, S2, S3, S4], selector: ( ...stores: [S1, S2, S3, S4] ) => R, listener: Listener<[R]> ): Disposer;
function onChange<S1 extends object, S2 extends object, S3 extends object, R> ( stores: [S1, S2, S3], selector: ( ...stores: [S1, S2, S3] ) => R, listener: Listener<[R]> ): Disposer;
function onChange<S1 extends object, S2 extends object, R> ( stores: [S1, S2], selector: ( ...stores: [S1, S2] ) => R, listener: Listener<[R]> ): Disposer;
function onChange<S1 extends object, R> ( store: S1, selector: ( store: S1 ) => R, listener: Listener<[R]> ): Disposer;
function onChange<Store extends object, R> ( store: Store | Store[], selector: (( store: Store ) => R) | (( ...stores: Store[] ) => R), listener?: Listener<[R] | Store[]> ): Disposer {

  if ( !listener ) return onChange ( store, SELECTOR_IDENTITY, selector );

  const stores = Utils.isStores ( store ) ? store : [store],
        storesNr = stores.length;

  if ( !storesNr ) throw Errors.storesEmpty ();

  const disposers: Disposer[] = [];

  let rootsChangeAllCache: Map<Store, string[]> = new Map ();

  const handler = () => {

    if ( selector === SELECTOR_IDENTITY ) return listener.apply ( undefined, stores );

    let data;

    const rootsChangeAll = rootsChangeAllCache,
          rootsGetAll = record ( stores, () => data = selector.apply ( undefined, stores ) ) as unknown as Map<any, string[]>, //TSC
          isDataIdentity = ( storesNr === 1 ) ? data === stores[0] : areShallowEqual ( data, stores );

    rootsChangeAllCache = new Map ();

    if ( isDataIdentity ) return listener.apply ( undefined, stores );

    const isDataStore = stores.indexOf ( data ) >= 0;

    if ( isDataStore && ( rootsChangeAll.get ( data ) || EMPTY_ARRAY ).length ) return listener ( data );

    const isSimpleSelector = Array.from ( rootsGetAll.values () ).every ( paths => !paths.length );

    if ( isSimpleSelector ) return listener ( data );

    for ( let i = 0; i < storesNr; i++ ) {

      const store = stores[i],
            rootsChange = rootsChangeAll.get ( store ) || EMPTY_ARRAY;

      if ( !rootsChange.length ) continue;

      const rootsGet = rootsGetAll.get ( store ) || EMPTY_ARRAY;

      if ( !rootsGet.length ) continue;

      const changed = Utils.uniq ( rootsGet ).some ( rootGet => rootsChange.indexOf ( rootGet ) >= 0 );

      if ( changed ) return listener ( data );

    }

  };

  for ( let i = 0; i < storesNr; i++ ) {

    const store = stores[i],
          changes = ChangesSubscribers.get ( store );

    if ( !changes ) throw Errors.storeNotFound ();

    const disposer = changes.subscribe ( rootsChange => {

      rootsChangeAllCache.set ( store, rootsChange );

      if ( storesNr === 1 ) return handler ();

      return Scheduler.schedule ( handler );

    });

    disposers.push ( disposer );

  }

  return () => {

    for ( let i = 0, l = disposers.length; i < l; i++ ) disposers[i]();

  };

}

/* EXPORT */

export default onChange;
