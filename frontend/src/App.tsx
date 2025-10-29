import PhonkStudio from './studio/PhonkStudio';
import { StudioProvider } from './studio/state/useStudioStore';

const App = () => {
  return (
    <StudioProvider>
      <PhonkStudio />
    </StudioProvider>
  );
};

export default App;
