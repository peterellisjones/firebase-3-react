const mockDatabase = {};
require('firebase').initializeApp = () => {
  return {
    database: () => { return mockDatabase; },
    auth: () => { return {}; },
    storage: () => { return {}; },
  };
};

const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const { init, bindToCollection } = require('../dist/index.js');

const Comments = class extends React.Component {
  render() {
    return <div>{this.renderComments()}</div>;
  }

  renderComments() {
    const comments = this.props.data;
    return Object.keys(comments).map((id) => {
      const comment = comments[id];

      return <p key={id}>{comment}</p>;
    });
  }
};

Comments.propTypes = {
  data: React.PropTypes.objectOf(React.PropTypes.string),
};

const BoundComments = bindToCollection(Comments);

describe('bindToCollection', () => {
  let callback = null;
  let orderedByValue = false;

  beforeEach(() => {
    orderedByValue = false;
    mockDatabase.ref = (reference) => {
      expect(reference).toEqual('comments');
      const ref = {
        on: (_, cb) => { callback = cb; return; },
        off: () => { return; },
      };
      ref.orderByValue = () => {
        orderedByValue = true;
        return ref;
      };
      return ref;
    };

    init();
  });

  describe('when not loaded', () => {
    describe('when loader is not specified', () => {
      it('is empty', () => {
        const element = TestUtils.renderIntoDocument(
          <BoundComments firebaseRef="comments" debug={true} />
        );

        expect(ReactDOM.findDOMNode(element)).toEqual(null);
      });
    });

    describe('when loader is specified', () => {
      it('displays the loader', () => {
        const element = TestUtils.renderIntoDocument(
          <BoundComments
            debug={true}
            firebaseRef="comments"
            loader={() => { return <p>Loading</p>; }}
          />
        );

        expect(ReactDOM.findDOMNode(element).textContent).toEqual('Loading');
      });
    });
  });

  describe('when loaded', () => {
    it('passes data to the component class', () => {
      const element = TestUtils.renderIntoDocument(
        <BoundComments firebaseRef="comments" debug={true} />
      );

      callback({ val: () => { return { '0': '123456' }; }});

      expect(ReactDOM.findDOMNode(element).textContent).toEqual('123456');
    });
  });

  describe('when the data changes', () => {
    it('re-renders the component', () => {
      const element = TestUtils.renderIntoDocument(
        <BoundComments firebaseRef="comments" debug={true} />
      );

      callback({ val: () => { return { '0': '123456' }; }});

      expect(ReactDOM.findDOMNode(element).textContent).toEqual('123456');

      callback({ val: () => { return { '0': 'abcdef' }; }});
      expect(ReactDOM.findDOMNode(element).textContent).toEqual('abcdef');
    });
  });

  describe('when a query is specified', () => {
    it('passes the query to firebase', () => {
      const element = TestUtils.renderIntoDocument(
        <BoundComments
          debug={true}
          firebaseRef="comments"
          firebaseQuery={{ orderByValue: true }}
        />
      );

      callback({ val: () => { return { '0': '123456' }; }});

      expect(ReactDOM.findDOMNode(element).textContent).toEqual('123456');

      expect(orderedByValue).toEqual(true);
    });
  });
});
