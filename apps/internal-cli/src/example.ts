type Bar = {
  id: string;
};

type Baz = {
  id: number;
};

type Result = Bar & Baz;

type Id = Result[];
