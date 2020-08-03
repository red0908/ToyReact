import {ToyReact, Component} from './ToyReact.js'

class MyComponent extends Component{
  render () {
    return <div>hi
      {
       true
      }
      {
        this.chrildren
      }
    </div>
  }
}

let a = <MyComponent id="a" name="a">
   <div>121</div>
   <div>122</div>
</MyComponent>;


ToyReact.render(
  a,
  document.body
)


/**
 * a被翻译成了下面的代码
 * 
 var a = ToyReact.createElement("div", {
  id: "a",
  name: "a"
}, ToyReact.createElement("span", null, "hello "), 
ToyReact.createElement("span", null, "world"), 
ToyReact.createElement("span", null, "!"));

类比于react的
return React.createElement('div', {className: 'shopping-list'},
  React.createElement('h1', ... h1 children ... ),
  React.createElement('ul', ... ul children ... )
);
*/
/**
document.body.appendChild(a)
*/
