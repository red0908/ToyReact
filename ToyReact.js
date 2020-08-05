
let childrenSymbol = Symbol("children")
class ElementWrapper {
  constructor (type) {
    this.type = type
    this.props = Object.create(null)
    this[childrenSymbol] = []
    this.children = []
  }
  setAttribute (key, value) {
    // \s为空白 \S为非空白，加一起为所有字符
    /*if (key.match(/^on([\s\S]+)$/)) {
        let eventName = RegExp.$1.replace(/^[s\S]/, s => s.toLowerCase())
        this.root.addEventListener(eventName, value)
    }
    if (key === 'className')
      key = 'class'
    this.root.setAttribute(key, value)*/
    this.props[key] = value
  }
  // get children () {
  //   return this[childrenSymbol].map(child => child.vdom)
  // }
  appendChild (vChild) {
    this[childrenSymbol].push(vChild)
    this.children.push(vChild.vdom)
    /*let range = document.createRange()
    if (this.root.children.length) {
      range.setStartAfter(this.root.lastChild)
      range.setEndAfter(this.root.lastChild)
    } else {
      range.setStart(this.root,0)
      range.setEnd(this.root, 0)
    }
    vChild.mountTo(range)*/
  }
  get vdom () {
    return this
  }
  mountTo (range) {
    this.range = range

    let placeholder = document.createComment('placeholder')
    let endRange = document.createRange()
    endRange.setStart(range.endContainer, range.endOffset)
    endRange.setEnd(range.endContainer, range.endOffset)
    endRange.insertNode(placeholder)

    range.deleteContents()
    let element = document.createElement(this.type)

    for (let key in this.props) {
      let value = this.props[key]
      if (key.match(/^on([\s\S]+)$/)) {
        let eventName = RegExp.$1.replace(/^[s\S]/, s => s.toLowerCase())
        element.addEventListener(eventName, value)
      }
      if (key === 'className')
        key = 'class'
      element.setAttribute(key, value)
    }
    for (let child of this.children) {
      let range = document.createRange()
      if (element.children.length) {
        range.setStartAfter(element.lastChild)
        range.setEndAfter(element.lastChild)
      } else {
        range.setStart(element,0)
        range.setEnd(element, 0)
      }
      child.mountTo(range)
    }
    range.insertNode(element)
  }
}
class TextWrapper {
  constructor (type) {
    this.root = document.createTextNode(type)
    this.type = '#text'
    this.children = []
    this.props = Object.create(null)
  }
  mountTo (range) {
    this.range = range
    range.deleteContents()
    range.insertNode(this.root)
  }
  get vdom () {
    return this
  }
}
// wrapper让Component和原生的dom行为一致
export class Component {
  constructor () {
    this.children = []
    this.props = Object.create(null)
  }
  get type () {
    return this.constructor.name
  }
  setAttribute (key, value) {
    this.props[key] = value
    this[key] = value
  }
  mountTo (range) {
    this.range = range
    this.update()
  }
  get vdom () {
    return this.render().vdom
  }
  update () {
    // let placeholder = document.createComment('placeholder')
    // let range = document.createRange()
    // range.setStart(this.range.endContainer, this.range.endOffset)
    // range.setEnd(this.range.endContainer, this.range.endOffset)
    // range.insertNode(placeholder)
    // this.range.deleteContents()
    let vdom = this.vdom
    if (this.oldVdom) {
      // 出来的为两个ElementWapper的类实例
      // 可以比对它们的type、props、children（删、加）
      let isSameNode = (node1, node2) => {
        if (node1.type !== node2.type) 
          return false
        for (let key in node1.props) {
          // if (typeof node1.props[key] === 'function' && typeof node2.props[key] === 'function'
          // && node1.props[key].toString() === node2.props[key].toString()){
          //   continue
          // }
          if (typeof node1.props[key] === 'obj' && typeof node2.props[key] === 'obj'
            && JSON.stringify(node1.props[key]) === JSON.stringify(node2.props[key])){
            continue
          }
          if (node1.props[key] !== node2.props[key])
            return false
        }
        if (Object.keys(node1.props).length !== Object.keys(node2.props).length)
          return false
        return true
      }
      let isSameTree = (node1, node2) => {
        if (!isSameNode(node1, node2))
          return false
        if (node1.children.length !== node2.children.length) 
          return false
        for (let i = 0; i < node1.children.length; i++) {
          if (!isSameTree(node1.children[i], node2.children[i]))
            return false
        }
        return true
      }
      // if (isSameTree(vdom, this.vdom)){
      //   console.log('isSameTree');
      //   return
      // }
      let replace = (newTree, oldTree, indent) => {
        console.log(indent + 'new：',newTree);
        console.log(indent + 'old：',oldTree);
        if (isSameTree(newTree, oldTree)) {
          console.log('all same');
          return
        }
        if (!isSameNode(newTree, oldTree)) {
          console.log(oldTree.type,'all different');
          newTree.mountTo(oldTree.range)
        } else {
          for (let i = 0; i < newTree.children.length; i++) {
            replace(newTree.children[i], oldTree.children[i], "   " + indent)
          }
        }
      }
      console.log('new：',vdom);
      console.log('old：',this.vdom);
      replace(vdom, this.oldVdom, '')
    } else {
      vdom.mountTo(this.range)
    }
    this.oldVdom = vdom

    // placeholder.parentNode.removeChild(placeholder)
  }
  appendChild (vChild) {
    this.children.push(vChild)
  }
  setState (state) {
    let merge = (oldState, newState) => {
      for (let p in newState) {
        if (typeof newState[p] === "object" && newState[p] !== null) {
          if (typeof oldState[p] !== "object") {
            if (newState[p] instanceof Array)
              oldState[p] = []
            else
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
          if (child === null || child === void 0)
            child = ""
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