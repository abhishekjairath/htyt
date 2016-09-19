const searchYoutube = require("./search-youtube.js");

exports.middleware = (store) => (next) => (action) => {
  if ('SESSION_ADD_DATA' === action.type) {
    const { data } = action;
    if (/(htyt.*: command not found)|(command not found: htyt.*)/.test(data)) {
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
    }

    componentWillReceiveProps (next) {
      this.perpareEmbed(next.htytEmbed);
      if (next.htytEmbed && !this.props.htytEmbed) {
        notify(next.htytEmbed);
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
      
      if (videoId && screen.cursorNode_.nodeName === '#text') {
        const cursorNode = document.createElement('iframe');
        cursorNode.src = `https://www.youtube.com/embed/${videoId}?rel=0&amp;controls=0&amp;showinfo=0`
        cursorNode.frameborder = "0";
        cursorNode.allowfullscreen;
        cursorNode.height = '315';
        cursorNode.width = '560';
        screen.cursorRowNode_.style['margin-bottom'] = '350px';
        screen.cursorRowNode_.replaceChild(cursorNode, screen.cursorNode_)
        screen.cursorNode_ = cursorNode
      }

      // const rows = []
      // let lastRow = screen.cursorRowNode_

      // while (true) {
      //   rows.unshift(lastRow)
      //   if (lastRow.children.length > 1) break
      //   lastRow = lastRow.previousSibling
      //   if (!lastRow || !lastRow.getAttribute('line-overflow')) break
      // }

      // const textContent = rows.map((r) => r.lastChild.textContent).join('')
      // const re = urlRegex()
      // const urls = []
      // let match

      // while (match = re.exec(textContent)) { // eslint-disable-line
      //   const text = match[0]
      //   const url = this.getAbsoluteUrl(text)
      //   const start = re.lastIndex - text.length
      //   const end = re.lastIndex
      //   const id = this.id++
      //   urls.push({id, url, start, end})
      // }

      // if (!urls.length) {
      //   match = stackTraceRe.exec(textContent)
      //   if (match) {
      //     const url = match[1]
      //     const start = textContent.indexOf('/')
      //     const end = textContent.indexOf(')')
      //     const id = this.id++
      //     urls.push({id, url, start, end, fileName: url})
      //   }
      // }
      // if (!urls.length) return

      // let rowStart = 0
      // let rowEnd = 0
      // let urlIndex = 0

      // const htmls = rows.map((row, i) => {
      //   rowStart = rowEnd
      //   rowEnd += row.lastChild.textContent.length
      //   let textStart = rowStart

      //   let html = ''

      //   while (urls[urlIndex]) {
      //     const { id, url, start, end, fileName } = urls[urlIndex]

      //     if (start > textStart) {
      //       const textEnd = start < rowEnd ? start : rowEnd
      //       html += escapeHTML(textContent.slice(textStart, textEnd))
      //     }

      //     if (start < rowEnd) {
      //       const urlStart = start > rowStart ? start : rowStart
      //       const urlEnd = end < rowEnd ? end : rowEnd
      //       let anchor
      //       if (fileName) {
      //         anchor = `<a href="${escapeHTML(url)}" data-id="${id}" data-file-name="${fileName}">`
      //       }
      //       anchor = `<a href="${escapeHTML(url)}" data-id="${id}">`
      //       html += anchor
      //       html += escapeHTML(textContent.slice(urlStart, urlEnd))
      //       html += '</a>'
      //     }

      //     if (end > rowEnd) break

      //     textStart = end
      //     urlIndex++
      //   }

      //   if (!urls[urlIndex]) {
      //     html += escapeHTML(textContent.slice(textStart, rowEnd))
      //   }

      //   return html
      // })

      // for (let i = 0, l = rows.length; i < l; i++) {
      //   rows[i].lastChild.innerHTML = htmls[i]
      // }

    }

    render () {
      return React.createElement(Term, Object.assign({}, this.props, {
        onTerminal: this._onTerminal
      }));
    }

  }
};
