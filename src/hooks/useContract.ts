/**
 * useContract hook description
 */
// Types for useContract
export const useContract = () => {
  const [state, setState] = useState();
  useEffect(() => {  return state;
}, []);
};