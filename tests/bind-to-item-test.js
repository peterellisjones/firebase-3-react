const mockDatabase = {};
require('firebase').initializeApp = () => {
  return {
    database: () => { return mockDatabase; },
    auth: () => { return {}; },
    storage: () => { return {}; },
  };
};

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import { init, bindToItem } from '../dist/index.js';

const Comment = class extends React.Component {
  render() {
    return <p className="comment">{this.props.data}</p>;
  }
};

Comment.propTypes = {
  data: React.PropTypes.string,
};

const BoundComment = bindToItem(Comment);

describe('bindToItem', () => {
  let callback = null;

  beforeEach(() => {
    mockDatabase.ref = (reference) => {
      expect(reference).toEqual('comments/123');
      return {
        on: (_, cb) => { callback = cb; return; },
        off: () => { return; },
      };
    };

    init();
  });

  describe('when not loaded', () => {
    describe('when loader is not specified', () => {
      it('is empty', () => {
        const element = TestUtils.renderIntoDocument(
          <BoundComment firebaseRef="comments/123"/>
        );

        const node = ReactDOM.findDOMNode(element);
        expect(node).toEqual(null);
      });
    });

    describe('when loader is specified', () => {
      it('displays the loader', () => {
        const element = TestUtils.renderIntoDocument(
          <BoundComment
            firebaseRef="comments/123"
            loader={() => { return <p>Loading</p>; }}
          />
        );

        const node = ReactDOM.findDOMNode(element);
        expect(node.textContent).toEqual('Loading');
      });
    });
  });

  describe('when loaded', () => {
    it('passes data to the component class', () => {
      const element = TestUtils.renderIntoDocument(
        <BoundComment firebaseRef="comments/123"/>
      );

      callback({ val: () => { return '123456'; }});

      const node = ReactDOM.findDOMNode(element);
      expect(node.textContent).toEqual('123456');
    });
  });

  describe('when the data changes', () => {
    it('re-renders the component', () => {
      const element = TestUtils.renderIntoDocument(
        <BoundComment firebaseRef="comments/123"/>
      );

      callback({ val: () => { return '123456'; }});

      let node = ReactDOM.findDOMNode(element);
      expect(node.textContent).toEqual('123456');

      callback({ val: () => { return 'abcdef'; }});
      node = ReactDOM.findDOMNode(element);
      expect(node.textContent).toEqual('abcdef');
    });
  });
});
