
/* IMPORT */

import {describe} from 'ava-spec';
import * as Enzyme from 'enzyme';
import {mount} from 'enzyme';
import Adapter1 from 'enzyme-adapter-react-16'; //UGLY: For whatever reason we need to use both kinds
import * as Adapter2 from 'enzyme-adapter-react-16'; //UGLY: For whatever reason we need to use both kinds
import delay from 'promise-resolve-timeout';
import * as React from 'react';
import {API, API2, AppSingleWithoutSelector, AppSingleWithSelector, AppMultipleWithoutSelector, AppMultipleWithSelector} from '../fixtures/app';
import {useStore} from '../../x/react';

Enzyme.configure ({ adapter: new ( Adapter1 || Adapter2 ) () });

/* USE STORE */

describe ( 'useStore', it => {

  it.serial ( 'works with single stores', async t => {

    const Apps = [AppSingleWithoutSelector, AppSingleWithSelector];

    for ( const App of Apps ) {

      API.store.value = 0;

      let rendersNr = 0,
          rendering = () => rendersNr++;

      const app = mount ( React.createElement ( App, {rendering} ) ),
            getText = selector => app.find ( selector ).text (),
            getValue = () => getText ( '#value' ),
            click = selector => app.find ( selector ).simulate ( 'click' );

      t.is ( getValue (), '0' );
      t.is ( rendersNr, 1 );

      click ( '#increment' );
      click ( '#increment' );
      click ( '#increment' );

      await delay ( 100 );

      t.is ( getValue (), '3' );
      t.is ( rendersNr, 2 );

      click ( '#decrement' );

      await delay ( 100 );

      t.is ( getValue (), '2' );
      t.is ( rendersNr, 3 );

    }

  });

  it.serial ( 'works with multiple stores', async t => {

    const Apps = [AppMultipleWithoutSelector, AppMultipleWithSelector];

    for ( const App of Apps ) {

      API.store.value = 0;
      API2.store.value = 0;

      let rendersNr = 0,
          rendering = () => rendersNr++;

      const app = mount ( React.createElement ( App, {rendering} ) ),
            getText = selector => app.find ( selector ).text (),
            getValue = () => getText ( '#value' ),
            click = selector => app.find ( selector ).simulate ( 'click' );

      t.is ( getValue (), '0' );
      t.is ( rendersNr, 1 );

      click ( '#one-increment' );
      click ( '#one-increment' );
      click ( '#one-increment' );

      await delay ( 100 );

      t.is ( getValue (), '0' );
      t.is ( rendersNr, 2 );

      click ( '#one-increment' );
      click ( '#two-increment' );

      await delay ( 100 );

      t.is ( getValue (), '4' );
      t.is ( rendersNr, 3 );

      click ( '#one-increment' );
      click ( '#two-increment' );

      await delay ( 100 );

      t.is ( getValue (), '10' );
      t.is ( rendersNr, 4 );

    }

  });

  it ( 'throws if an empty array of stores has been provided ', t => {

    t.throws ( () => useStore ( [] ), /empty/i );

  });

});
