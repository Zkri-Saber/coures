In Part 2, your Flask app sent HTML pages to a browser. But today, the same backend often serves a website, a phone app, and other companies' software all at once. They all talk to it through an **API**.

## What is an API?

An **API** (Application Programming Interface) is a defined way for one piece of software to ask another for data or actions, without needing to know how it works inside.

Think of a restaurant. You (the **client**) don't walk into the kitchen (the **server**). You give your order to a waiter (the **API**), who follows clear rules about what you can order and how, then brings back your food (the **response**).

You use APIs all the time without noticing:

- A weather app asks a weather service's API for the forecast.
- A "Log in with Google" button uses Google's identity API.
- An online shop's checkout calls a payment provider's API.
- The to-do app you just built: your JavaScript `fetch` calls were already API requests.

## Why APIs matter

- **One backend, many frontends.** The same API can power a website, an iPhone app and an Android app.
- **Separation.** Frontend and backend teams can work independently, as long as they agree on the API.
- **Hiding complexity.** Clients don't need to know about your database or code; they only see the API.
- **Controlled access.** The API decides what each client may see and do (Part 4 is all about this).

## How the internet carries API requests

APIs on the web travel through layers of **protocols**, which are agreed rules for communication:

| Layer | Protocol | Job |
| --- | --- | --- |
| Application | **HTTP** (or HTTPS) | The format of requests and responses: methods, URLs, headers, status codes |
| Security | **TLS** | Encrypts the connection. HTTPS is HTTP over TLS |
| Transport | **TCP** | Delivers data reliably and in order |
| Internet | **IP** | Addresses and routes packets between computers |

As a backend developer, you mostly work at the HTTP layer. Flask handles the rest for you.

## REST

**REST** (Representational State Transfer) is a style for designing web APIs. An API that follows it is called **RESTful**. Its main ideas:

1. **Client-server:** the client and server are separate and can change independently.
2. **Stateless:** each request contains everything the server needs to handle it. The server doesn't remember previous requests.
3. **Resources with URLs:** everything is a **resource** (a book, a user, an order) with its own address, like `/api/books/7`.
4. **A uniform interface:** you use standard HTTP methods to act on resources: `GET` to read, `POST` to create, `PATCH` or `PUT` to update, `DELETE` to remove.
5. **Cacheable:** responses say whether they can be cached, to save repeated work.
6. **Layered:** clients don't need to know if they're talking to the real server or a proxy, load balancer or cache in between.

## JSON: the language of APIs

Most modern APIs send data as **JSON** (JavaScript Object Notation), a simple text format that almost every programming language can read:

```json
{
  "success": true,
  "book": {
    "id": 7,
    "title": "The Hobbit",
    "author": "J. R. R. Tolkien",
    "rating": 5
  }
}
```

It looks almost exactly like a Python dictionary, and Flask converts between the two for you.

:::quiz
Q: In the restaurant comparison, what plays the role of the API?
- [ ] The customer
- [x] The waiter, who takes orders in a set format and brings back results
- [ ] The kitchen
Why: The API sits between client and server, defining what can be requested and how.

Q: What does "stateless" mean in REST?
- [ ] The server never stores any data
- [x] Each request carries all the information the server needs; the server doesn't rely on remembering earlier requests
- [ ] The API has no URLs
Why: Statelessness makes APIs simpler to scale, because any server can handle any request.

Q: Which is the most RESTful URL for book number 7?
- [ ] `/api/getBook?id=7`
- [x] `/api/books/7`
- [ ] `/api/deleteOrShowBook/7`
Why: REST URLs name resources with nouns. The HTTP method (GET, DELETE...) says what to do with them.
:::
