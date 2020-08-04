
class ElementWrapper {
  constructor (type) {
    this.root = document.createElement(type)
  }
  setAttribute (key, value) {
    // \s为空白 \S为非空白，加一起为所有字符
    if (key.match(/^on([\s\S]+)$/)) {
        let eventName = RegExp.$1.replace(/^[s\S]/, s => s.toLowerCase())
        this.root.addEventListener(eventName, value)
    }
    if (key === 'className')
      key = 'class'
    this.root.setAttribute(key, value)
  }
  appendChild (vChild) {
    let range = document.createRange()
    if (this.root.children.length) {
      range.setStartAfter(this.root.lastChild)
      range.setEndAfter(this.root.lastChild)
    } else {
      range.setStart(this.root,0)
      range.setEnd(this.root, 0)
    }
    vChild.mountTo(range)
  }
  mountTo (range) {
    range.deleteContents()
    range.insertNode(this.root)
  }
}
class TextWrapper {
  constructor (type) {
    this.root = document.createTextNode(type)
  }
  mountTo (range) {
    range.deleteContents()
    range.insertNode(this.root)
  }
}
// wrapper让Component和原生的dom行为一致
export class Component {
  constructor () {
    this.children = []
    this.props = Object.create(null)
  }
  setAttribute (key, value) {
    this.props[key] = value
    this[key] = value
  }
  mountTo (range) {
    this.range = range
    this.update()
  }
  update () {
    let placeholder = document.createComment('placeholder')
    let range = document.createRange()
    range.setStart(this.range.endContainer, this.range.endOffset)
    range.setEnd(this.range.endContainer, this.range.endOffset)
    range.insertNode(placeholder)
    this.range.deleteContents()
    let vdom = this.render()
    vdom.mountTo(this.range)

    placeholder.parentNode.removeChild(placeholder)
  }
  appendChild (vChild) {
    this.children.push(vChild)
  }
  setState (state) {
    let merge = (oldState, newState) => {
      for (let p in newState) {
        if (typeof newState[p] === "object") {
          if (typeof oldState[p] !== "object") {
            oldState[p] = {}
          } 
          merge(oldState[p], newState[p])
        } else {
          oldState[p] = newState[p]
        }
      }
    }
    if (!this.state && state)
      this.state = {}
    merge(this.state, state)
    console.log(this.state);
    this.update()
  }
}


export let ToyReact = {
  createElement (type, attribute, ...children) {
    let element;
    if (typeof type === 'string')
      element = new ElementWrapper(type)
    else
      element = new type

    for (let key in attribute) {
      element.setAttribute(key,attribute[key])
    }

    let insertchildren = (children) => {
      children.forEach(child => {
        if (typeof child === 'object' && child instanceof Array) {
          insertchildren(child)
        } else {
          if (!(child instanceof Component)
          && !(child instanceof ElementWrapper)
          && !(child instanceof TextWrapper)){
            child = String(child)
          }
            if (typeof child === 'string') {
            child = new TextWrapper(child)
          }
          element.appendChild(child)
        }
      })
    }
    insertchildren(children)

    return element
  },
  render (vdom, element) {
    let range = document.createRange()
    if (element.children.length) {
      range.setStartAfter(element.lastChild)
      range.setEndAfter(element.lastChild)
    } else {
      range.setStart(element,0)
      range.setEnd(element, 0)
    }
    //递归调用
    vdom.mountTo(range)
    // document.appendChild(vdom)
  }
}