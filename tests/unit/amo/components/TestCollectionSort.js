import * as React from 'react';

import CollectionSort, {
  CollectionSortBase,
} from 'amo/components/CollectionSort';
import { CLIENT_APP_FIREFOX, COLLECTION_SORT_NAME } from 'amo/constants';
import {
  createFakeCollectionDetail,
  createContextWithFakeRouter,
  createFakeEvent,
  createFakeHistory,
  createInternalCollectionWithLang,
  dispatchClientMetadata,
  fakeI18n,
  shallowUntilTarget,
} from 'tests/unit/helpers';

describe(__filename, () => {
  const render = ({ ...otherProps } = {}) => {
    const { history, ...props } = {
      collection: createInternalCollectionWithLang({
        detail: createFakeCollectionDetail(),
      }),
      editing: false,
      filters: {},
      i18n: fakeI18n(),
      history: createFakeHistory(),
      ...otherProps,
    };

    return shallowUntilTarget(
      <CollectionSort {...props} />,
      CollectionSortBase,
      {
        shallowOptions: createContextWithFakeRouter({ history }),
      },
    );
  };

  it('renders a sort select', () => {
    const sort = COLLECTION_SORT_NAME;
    const { store } = dispatchClientMetadata();

    const root = render({
      filters: { collectionSort: sort },
      store,
    });

    expect(root.find('.CollectionSort')).toHaveLength(1);
    expect(root.find('.CollectionSort-select')).toHaveProp(
      'defaultValue',
      sort,
    );

    const options = root.find('.CollectionSort-select').children();
    root
      .instance()
      .sortOptions()
      .forEach((option, index) => {
        expect(options.at(index)).toHaveProp('value', option.value);
        expect(options.at(index)).toHaveText(option.children);
      });
  });

  describe('onSortSelect', () => {
    it.each([true, false])(
      `calls history.push with expected pathname and query when a sort is selected and editing is %s`,
      (editing) => {
        const slug = 'some-slug';
        const userId = 123;
        const page = 2;
        const sort = COLLECTION_SORT_NAME;
        const clientApp = CLIENT_APP_FIREFOX;
        const lang = 'en-US';
        const queryParams = { page, collection_sort: sort };
        const collection = createInternalCollectionWithLang({
          detail: createFakeCollectionDetail({
            authorId: userId,
            slug,
          }),
        });

        const { store } = dispatchClientMetadata({ clientApp, lang });
        const history = createFakeHistory();

        const root = render({
          collection,
          editing,
          filters: { page, collectionSort: sort },
          history,
          store,
        });

        const fakeEvent = createFakeEvent({
          currentTarget: { value: sort },
        });
        const select = root.find('.CollectionSort-select');
        select.simulate('change', fakeEvent);

        const pathname = `/${lang}/${clientApp}/collections/${userId}/${slug}/${
          editing ? 'edit/' : ''
        }`;

        sinon.assert.calledWith(history.push, {
          pathname,
          query: queryParams,
        });
      },
    );
  });
});
