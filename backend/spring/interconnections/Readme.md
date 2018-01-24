**Interconnections microservice**

This microservice finds flight interconnections between
a source and a destination airport inside the provided time window.

It uses two other microservices:

https://api.ryanair.com/core/3/routes : provides a graph of valid routes between airports.

https://api.ryanair.com/timetable/3/schedules/ provides available flights between
two airports inside a given time window.

**Implementation**

The service works with Spring Boot and makes use of Guava graphs. It also
uses the new time API from Java 8.

First it retrieves all the available routes by using the routes API.

Then it builds a directed cyclic graph of routes between airports and
finds all the paths between the origin and destination airports of length 2
or less.

After this for each path it finds all the flights that follow the edges
of that path and that fall in the provided time window.

Paths of length two have can have two flights with one stop, all the possible
flight combinations are calculated in that case.

**Limitations**

- The flight interconnections can be either direct with just one flight
connecting the source and destination airports or they can have two flights
making one stop at an intermediate airport.

- The time window is limited to a span of 30 days to avoid very big queries.

**Improvements**

- The path finding algorithm is recursive it would be faster and use
less memory by making an iterative version.

- The calls to the schedules service and the post processing can be paralellized,
that would make the service much faster since most of the time is wasted
waiting for the service to respond on each call.

