class Example {
  location = "Class";

  arrow = () => {
    console.log("arrow", this);
  };

  method() {
    console.log("method", this);
  }
}

const obj = {
  location: "Object",
  arrow: new Example().arrow,
  method: new Example().method,
};

obj.arrow(); // { location: 'Class' }
obj.method(); // { location: 'Object' }
