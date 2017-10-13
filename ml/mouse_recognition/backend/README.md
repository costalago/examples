# Backend

This is the process that loads the neural network an analyzes incoming mouse input sequences.

The process runs in the background and has an API exported with a RPC library called pyro.

A pyro nameserver has to be launched so that clients of the API are able to find the service
with just a name.
