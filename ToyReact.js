
class ElementWrapper {
  constructor (type) {
    this.root = document.createElement(type)
  }
  setAttribute (key, value) {
    this.root.setAttribute(key, value)
  }
  appendChild (vChild) {
    vChild.mountTo(this.root)
  }
  mountTo (parent) {
    parent.appendChild(this.root)
  }
}
class TextWrapper {
  constructor (type) {
    this.root = document.createTextNode(type)
  }
  mountTo (parent) {
    parent.appendChild(this.root)
  }
}
// wrapper让Component和原生的dom行为一致
export class Component {
  constructor () {
    this.chrildren = []
  }
  setAttribute (key, value) {
    this[key] = value
  }
  mountTo (parent) {
    let vdom = this.render()
    vdom.mountTo(parent)
  }
  appendChild (vChild) {
    this.chrildren.push(vChild)
  }
}


export let ToyReact = {
  createElement (type, attribute, ...chrildren) {
    let element;
    if (typeof type === 'string')
      element = new ElementWrapper(type)
    else
      element = new type

    for (let key in attribute) {
      element.setAttribute(key,attribute[key])
    }

    let insertchrildren = (chrildren) => {
      chrildren.forEach(child => {
        if (typeof child === 'object' && child instanceof Array) {
          insertchrildren(child)
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
    insertchrildren(chrildren)

    return element
  },
  render (vdom, element) {
    //递归调用
    vdom.mountTo(element)
    // document.appendChild(vdom)
  }
}