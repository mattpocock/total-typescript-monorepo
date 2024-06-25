// And is a much better approach than these
// 'bags of optionals'.
type DataState = {
  isLoading: boolean;
  data?: string;
  error?: string;
};
