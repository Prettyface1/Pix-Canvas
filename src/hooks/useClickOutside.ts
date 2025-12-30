// Types for useClickOutside
export const useClickOutside = () => {
  const [state, setState] = useState();
  useEffect(() => {  return state;
}, []);
};