import { GoogleOAuthProvider } from '@react-oauth/google';
import { Route, Switch } from "wouter";
import Main from "./Main";
import LoginPage from "./login/page";
import SignupPage from "./signup/page";


const App = () => (
    <GoogleOAuthProvider clientId="304531247476-58f940f3b0dgrupg95cdo8b51fspupdv.apps.googleusercontent.com">
        <Switch>
            <Route path="/" component={Main} />
            <Route path="/login" component={LoginPage} />
            <Route path="/signup" component={SignupPage} />
            {/* Default route in a switch */}
            <Route>404: No such page!</Route>
        </Switch>
    </GoogleOAuthProvider>
);

export default App;