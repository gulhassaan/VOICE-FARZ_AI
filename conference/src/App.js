import React, { createContext } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Registration from './components/Private/Register.jsx';
import OtpVerification from './components/Secure/OtpVerification.jsx';
import ForgotPassword from './components/Secure/ForgotPassword.jsx';
import Dashboard from './components/Content/Dashboard.jsx';
import History from './components/Content/History.jsx';
import Layout from './components/Layout/Layout.jsx';
import Login from './components/Private/Login.jsx';
import NewPassword from './components/Secure/NewPassword.jsx';
import LiveRecord from './components/Screen/RecordScreen.jsx';
import UploadFile from './components/Screen/UploadFile.jsx';
import YouTubeLink from './components/Screen/YoutubeLink.jsx';
import HistoryDetails from './components/History/HistoryDetails.jsx';
import Setting from './components/Data/UserProfile.jsx';
import PricingTable from './components/Expo/Pricing.jsx';
import Contact from './components/Expo/Contact.jsx';
import Test from './components/test.jsx';
import SharedHistoryWrapper from './components/History/SharedHistoryWrapper.jsx'; // Import the wrapper component
import './index.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const TokenContext = createContext(null);

function App() {
  const token = localStorage.getItem("token");
  return (
    <>
      <ToastContainer />
      <TokenContext.Provider value={token}>
        <Router basename={process.env.PUBLIC_URL || '/'}>
          <Switch>
            <Route path="/" exact component={Login} />
            <Route path="/register" exact component={Registration} />
            <Route path="/otp-verification" component={OtpVerification} />
            <Route path="/forgot-password" component={ForgotPassword} />
            <Route path="/new-password" component={NewPassword} />
            <Route path="/pricing" component={PricingTable} />
            <Route path="/contact" component={Contact} />
            <Route path="/test" component={Test} />
            
            {/**Routing that take Sidebar with itself  Start */}
            <Route path="/dashboard">
              <Layout>
                <Dashboard />
              </Layout>
            </Route>
            <Route path="/history">
              <Layout>
                <History />
              </Layout>
            </Route>
            <Route path="/live-record">
              <Layout>
                <LiveRecord />
              </Layout>
            </Route>
            <Route path="/upload-file">
              <Layout>
                <UploadFile />
              </Layout>
            </Route>
            <Route path="/youtube-link">
              <Layout>
                <YouTubeLink />
              </Layout>
            </Route>
            <Route path="/conversation/:id">
              <Layout>
                <HistoryDetails />
              </Layout>
            </Route>
            <Route path="/setting">
              <Layout>
                <Setting />
              </Layout>
            </Route>
            <Route path="/shared/:id">
                <SharedHistoryWrapper />
            </Route>
            {/** Routing that take Sidebar with itself End */}
          </Switch>
        </Router>
      </TokenContext.Provider>
    </>
  );
}

export default App;
