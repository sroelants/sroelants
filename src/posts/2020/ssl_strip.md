---
section: blog
title: "SSLstrip and HSTS"
author: Sam Roelants
date: 2020-09-19
layout: post.njk
tags:
  - post
  - cryptography
  - security
  - man in the middle attack
  - ssl/tls
description: "I recently found out about a nifty security attack called SSL
strip."
---

# SSL/TLS and Man-in-the-middle attacks
The biggest issue with all cryptography, both symmetric and public-key, is its
susceptibility to man-in-the-middle (MITM) attacks. Simply put, Alice and Bob
want to communicate securely by setting up a shared secret key they will use to
encrypt their messages. But, a malicious third party (Eve) intercepts the
messages, pretends to be Bob when talking to Alice and pretends to be Alice when
talking to Bob. Instead of Alice setting up a secret connection with Bob, 
Eve sets up a secret connection with both Alice and Bob, and relays all the
communications. Eve ends up controlling the entire communication.

![Man-in-the-middle attack](/assets/img/2020/man_in_the_middle.png)

Public-key crytpography doesn't have a solution for this problem, and the only
way we've found around this attack is the mechanism of _certificates_, signed by
(reliable) third parties, that Alice and Bob can use to prove that they are in 
fact who they claim they are. In order to prevent the signatures to be forged 
by yet another MITM attack, the public keys of most Certificate Authorities (CAs) 
that are needed to verify the certificate signatures typically come preinstalled 
with most modern browsers.

So, certificate verification is a big step in SSL/TLS, the protocol that all 
browsers use for secure communication (whenever you see `https://` in your 
browser URL bar).

# 302 redirects and SSL strip
While it seems like certificates completely eliminate the chance of MITM attacks
(unless the browser or CA private keys are compromised), there is still some 
surface area for attacks, like SSL strip. The basis for this attack lies in the
fact that most websites, say your email hosts website, is usually accessed
over `http`. The website then responds with an `http 302 Found` code, along 
with the location where the browser should go looking for the resource. Websites
use this mechanism to redirect all visits over `http` to the `https` served 
website instead. That is, when you go to `http://www.google.com`, you'll
automatically end up at `https://www.google.com`, probably without the user ever
noticing it.

And there's the rub: unless you're a very security-concious person, you wouldn't
even notice whether or not you've been redirected to the `https` version of the
website. {%sidenote%}Although browsers are really stepping up to give clear
warning of websites that are served up over insecure `http`{%endsidenote%}

Supposing you visit your mail provider's website over `http` -- let's be honest,
we all do --, a man in the middle could intercept this traffic and essentially
stop the redirect from happening. Instead, the man in the middle could set up 
a `https` connection with your mail provider, but simply downgrade from `https`
to `http` before sending the response back to the user. To the user, the only
noticeable difference would be that the connection remains over `http`
instead of `https`, but other than that, the user experience is identical. 

![SSL stripping attack](/assets/img/2020/ssl_strip.png)

Certificates are of no help here, because the user's browser never even realizes
it should be communicating over TLS!

At this point, of course, we're back to our classical MITM scenario: the 
malicous eavesdropper has access to all the unencrypted messages coming from the
unsuspecting user.

# HSTS
Does this mean TLS and certificates are essentially useless? Not entirely, and
there are definitely ways to somewhat mitigate this vulnerability. One easy
thing you could do as a web host is enabling HTTP Strict Transport Security
(HSTS). It's a specific `https` header that the server can set on its response
packets that intstructs the browser to only every allow the site to be accessed
over `https` for a given duration of time (eg, a year). Because the header can
only be set over `https`, it means that the user must have established an
`https` connection with the webserver at least once for HSTS to take effect.
This means the initial visit is still vulnerable to SSL stripping attacks, but
it greatly decreases the risk. 
