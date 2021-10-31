import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import SearchBooks from './pages/SearchBooks';
import SavedBooks from './pages/SavedBooks';
import Navbar from './components/Navbar';

// import apollo/client
import { ApolloProvider, ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
// instruct the Apollo instance in App.js to retrieve the user loggedIn token from localStorage every time we make a GraphQL API request
// `setContext` can create essentially a middleware function that will retrieve the token for us and combine it with the existing httpLink
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: '/graphql',
});

// use the setContext() function to retrieve the token from localStorage and set the HTTP request headers of every request to include the token, whether it's needed or not. 
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('id_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const client = new ApolloClient({
  // combine the `authLink` & `httpLink` objects so that every request retrieves the token and sets the request headers before making the request to the API
  // This way, our server can receive the request, check the token's validity, and allow us to continue our request if it's valid
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
    <Router>
      <>
        <Navbar />
        <Switch>
          <Route exact path='/' component={SearchBooks} />
          <Route exact path='/saved' component={SavedBooks} />
          <Route render={() => <h1 className='display-2'>Wrong page!</h1>} />
        </Switch>
      </>
    </Router>
    </ApolloProvider>
  );
}

export default App;
