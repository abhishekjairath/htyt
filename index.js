const searchYoutube = require("./search-youtube.js");

exports.middleware = (store) => (next) => (action) => {
  if ('SESSION_ADD_DATA' === action.type) {
    const { data } = action;
    if (/(htyt\.[\w\s]+: command not found)|(command not found: htyt\.[\w\s]+)/.test(data)) {
      let arg = data.substring(data.indexOf('.')+1, data.lastIndexOf(':'));
      if(!(/(^\s*$)/.test(arg))){
        store.dispatch({
          type: 'HTYT_QUERY',
          data: arg.trim()
        });
      }
    } else {
      next(action);
    }
  } else {
    next(action);
  }
};

exports.reduceUI = (state, action) => {
  switch (action.type) {
    case 'HTYT_QUERY': {
      return state.set('htytEmbed', action.data);
    }
  }
  return state;
};

exports.mapTermsState = (state, map) => {
  return Object.assign(map, {
    htytEmbed: state.ui.htytEmbed
  });
};

exports.getTermProps = (uid, parentProps, props) => {
  return Object.assign(props, {
    htytEmbed: parentProps.htytEmbed
  });
}

exports.decorateTerm = (Term, { React, notify }) => {
  return class extends React.Component {
    constructor (props, context) {
      super(props, context);
      this._onTerminal = this._onTerminal.bind(this);
      this._screenNode = null;
    }

    _onTerminal (term) {
      if (this.props.onTerminal) this.props.onTerminal(term);
      this._screenNode = term.screen_;
      this._cursor = term.cursorNode_;
    }

    componentWillReceiveProps (next) {
      if (next.htytEmbed != this.props.htytEmbed) {
        this.perpareEmbed(next.htytEmbed);
      }
    }

    perpareEmbed (htytEmbed){
      const self = this;
      if(htytEmbed){
        searchYoutube.find(htytEmbed, function(videoId){
          self.renderEmbed(videoId);
        });
      }
    }

    renderEmbed (videoId){
      const screen = this._screenNode;
      const cursor = this._cursor;
      if (videoId) {
        const cursorNode = document.createElement('iframe');
        cursorNode.src = `https://www.youtube.com/embed/${videoId}?rel=0&amp;controls=0&amp;showinfo=0`
        cursorNode.frameborder = "0";
        cursorNode.allowfullscreen;
        cursorNode.height = '315';
        cursorNode.width = '560';
        screen.cursorRowNode_.replaceChild(cursorNode, screen.cursorNode_)
        screen.cursorNode_ = cursorNode;
      }
    }

    render () {
      return React.createElement(Term, Object.assign({}, this.props, {
        onTerminal: this._onTerminal
      }));
    }

  }
};
