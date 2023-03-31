---
title: "What is your first factor?"
author: Sam Roelants
date: 2023-03-28
layout: "../../layouts/PostLayout.astro"
draft: true
tags:
  - opinion
  - security
  - two factor authentication
description: "A brief look into 2FA, one-time passwords, and why I think they're 
often misunderstood."
---

I like to think of myself as a security aware person. I use a password manager
for all of my services, encrypt my hard drives, enable 2FA where ever I can.
Heck, I even put this website on the HSTS preload list.[^1] Recently, I built [a
little tool](https://github.com/sroelants/tufa) that generates 2FA (one-time
password) codes from the command line. Partly to learn more about how they work,
partly because I find it annoying to have to grab for my phone every time I want
to log in to a service. A common reaction I got from several people was
_"Doesn't that defeat the purpose of **two-factor** authentication?"_ I feel
like that's a fundamental misunderstanding of two-factor authentication.

## One-time passwords and two factor authentication
It's a good thing to make sure we all agree on the same terms, since many of
them tend to be used interchangeably. 

Two-factor authentication simply means that the user has to pass _two_ checks to
prove that they are who they say they are. Typically, this will be a combination
of a password, a text message, a one-time-password sent to your email or phone
via text. Heck, if you've any accounts you created in the 90s, they'll probably
ask for your mother's maiden name. The security benefits of this are obvious.
Even if wrong-doer gets hold of _one_ of your "factors", they still won't be
able to access your account.

A one-time password is a token that can be used to authenticate a person.
Instead of authenticating a user by a static password, we share a token with the
user _out-of-band_. The user can then provide the token to prove they are, in
fact, who they claim they are. The identity of the user is entirely tied to
their _exclusive_ access to the shared out-of-band channel, and one-time
passwords are only as secure as the channel for communicating the token.

There is nothing that says that OTP are inherently only useful for 2FA: I'm sure
you've used services where the login flow consists of them sending you a link or
token to your email. That way, they don't need to deal with the security burden
of properly storing passwords. In a sense, they're offloading that burden to
your email provider. And, conversely, there's no reason 2FA _needs_ to use OTPs,
even if they've become a very popular mechanism. Like we've established, there's
always the good old _"What was your first dog's name?"_

## HOTP, TOTP, oh my...
As a brief excursion --because _who doesn't love learning_--, let's have a look
at Time-based One Time Passwords (TOTP), which are the mechanism you've probably
used if you use an app like [Authy](https://authy.com/) or [Google
Authenticator](https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&pli=1). 
The TOTP Spec is actually based on [HOTP](https://www.rfc-editor.org/rfc/rfc4226) (Hash-based One-time password), 
so let's start there first.

HOTP is a surprisingly simple mechanism. Roughly, it goes as follows:

1. The server creates a long-lasting _secret_ and shares this with the user
   (usually as a Base32 encoded string, or a QR-code thereof)
2. Both the server and the user keep a _counter_ of how many passwords have
   been generated so far.
3. The user generates a _hash_ from the secret _and_ the counter. 
4. The result is massaged a bit to jumble up the bits some more and truncate it
   the desired amount of bits.
5. The server performs the exact same procedure on its end, and verifies the 
   code.


This has a couple of interesting consequences. For one, the server and client
never have to communicate. Once the both have the secret, they can generate and
verify the code independently of one another. They are also _true_ one-time
passwords (unlike time-based OTPs, as we'll see in a second): Once a generated
token was used, the counter value increments both on the client and the server,
so next time the generated hash will be different and the server will be
expecting a different code.

You might also have noticed a pretty annoying down-side to this mechanism. If,
for whatever reason, I generate a code but don't _use_ it (e.g., due to a spotty
internet connection), now the server's counter will be behind on the client, and
it's down to the user to adjust their counter.

To remedy the rough UX, a more robust iteration on HOTP was introduced:
[Time-based one-time passwords](https://www.rfc-editor.org/rfc/rfc6238) (TOTP).
Rather than using a single-use counter, both server and client will use the
current Unix-time (the number of seconds elapsed since January 1, 1970, UTC),
measured in 30s windows. This "counter" gets hashed with the secret in the exact
same was as in the original HOTP scheme. This means we no longer need to worry 
about the user and server counters getting out of sync. As long as they
(roughly, within 30 seconds[^2]) agree on what the time is, they will generate the
same code. This also means _they aren't actually **one-time** passwords_. As
long as it's used within the same 30s window, an HOTP token can be used as many 
times as one pleases. This means that, without rate-limiting on the server's
end, HOTP are somewhat more prone to brute-forcing (albeit in a very short
window of 30 seconds), where HOTP are, _by construction_, not.

## What counts as a factor?

[^1]: [HTTP Strict-Transport-Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security) (HSTS)
is an HTTP header that tells the browser to _always_ upgrade the connection to 
HTTPS when visiting over HTTP, from now on. This is cool, but it still leaves 
the very first visit open to man-in-the-middle attacks. Browsers ship with a 
pre-defined lists of domains, the so-called _HSTS preload_ list, such that even
that very first visit will be forced to go over HTTPS. Clearly, this is
completely overkill for a static content website such as this one, and we can
hardly expect to ship _every single domain on the internet_ with the binary. I
wrote more about HSTS and the attacks it's meant to prevent [in a previous
post](./ssl-strip).

[^2]: Most services will add a bit of leeway on either end of these 30 seconds to
accomodate for slightly offet system times.

