---
title: "What is your first factor?"
author: Sam Roelants
date: 2023-03-28
layout: "../../layouts/PostLayout.astro"
description: A brief look into 2FA, one-time passwords, and why I think they're often misunderstood.
tags:
  - opinion
  - security
  - two factor authentication
---

I like to think of myself as a security aware person. I use a password manager
for all of my services, encrypt my hard drives, enable 2FA where ever I can.
Heck, I even put this website on the HSTS preload list.[^1] Recently, I built [a
little tool](https://github.com/sroelants/tufa) that generates 2FA (one-time
password) codes from the command line. Partly to learn more about how they work,
partly because I find it annoying to have to grab for my phone every time I want
to log in to a service. 

A common reaction I got from several people was *"Doesn't that defeat the
purpose of **two-factor** authentication?"* I feel like that's a fundamental
misunderstanding of two-factor authentication. Allow me to explain.

## Factors of authentication

Authentication --that is, _verifying your identity_-- can be done in a variety
of ways, many of which I'm sure you use on a daily basis. We all log in to most
of our accounts using passwords. Maybe you've had to show your ID when opening a
bank account. Or maybe you unlock your phone using a biometric verification like
a fingerprint scanner or facial recognition. Famously, methods of
authentication are clustered in three broad categories:

1. Something you _know_
2. Something you _have_
3. Something you _are_

The first one of these are things like passwords or --if you're still living in
the '90s-- some arbitrary "security question". You know, the classic *"What is your
mother's maiden name?"*

The second one can be something like a passport, an SSH key, or bank card.

The last one, which has become much more dominant these last few years now that
biometrics have become more pervasive and reliable, includes things like
fingerprint scanners and voice/facial recognition. An interesting property of
these methods that sets them apart from the other two categories, is that they
are impossible to revoke or update[^2]. If my password is leaked or I lose my
credit card, it's easy enough to revoke and change them out. It's not like I can
ever change my fingerprint or voice. That can actually have serious security
implications.

It should be clear that using any of these methods as a means for proving your
identity _entirely_ hinges on your having _exclusive_ access to them. If someone
else knows your password, steals your passport or fingerprint, they'll have
little problems posturing as you with whichever service the particular
credential was for.

But what if you _don't_ have exclusive access to these credentials? How do you
protect against your password getting leaked, or you losing your passport? The
obvious, rather inelegant, solution is to just keep adding extra authentication
layers. Instead of _just_ needing to know your password, maybe now they ask for
your password _and_ your security question. Or your phone pin _and_ a
fingerprint scan. This is typically called *"security in depth"*. Instead of
needing to break one mechanism, now an offender needs to break two, three, or
however many you've set up. This is what multi-factor authentication (MFA) is.

In fact, you might have noticed that many of the examples I gave above aren't
just "single factor". Many of them are, to some extent, MFA: Even if you get
hold of my bank card, it's useless if you don't also have my PIN (which,
presumably, only I know). My passport comes with a picture, so unless you look
somewhat like me, you'll be found out rather quickly. Arguably, these are _very_
flawed MFA mechanisms, but they are MFA, nonetheless.

## Your first factor
Which brings us back to the original question: does generating your 2FA codes
on your laptop defeat the purpose of 2FA? Well, let's think about what the two
factors in the typical 2FA scheme _are_.

The first, almost invariably, is your _password_. Whether that's a password
you've memorized, or stashed away in a password manager (whose password,
hopefully, you _do_ have memorized), doesn't fundamentally make a difference.
It sits squarely in the *something you know* column.

The second factor[^3] is essentially the shared secret token you recieved from
the service in question. This was most likely a Base32-encoded string, or a QR
code thereof that you scanned with your phone. That token is used to generate
those 6-digit codes, based on the timestamp when it was generated. The server
has access to the same token (since they generated it) and the timestamp, so 
validating your 6 digit code is as simple as generating a code on the server and
checking whether they are the same.

The second factor, then, is _something you have_: the shared secret token.[^4]
Whether this token is stored on my laptop, or on my phone, does not change the
character of the credential. Whether that token is protected behind an
additional passphrase on my computer, or behind a fingerprint scan on my phone,
adds additional security (again, _security in depth_), but does not change the
fact that _the password is the first factor, the token is the second._

The confusion comes from the fact that many people think your _computer_ is the
first factor of authentication. But, I cannot stress this enough: it is in fact
your _password_. The confusion probably stems from the fact that...

## It's all one-factor anyway
There is, of course, the elephant in the room that should not go unmentioned.
However much we like to set up 2FA on all our services, at the end of the day,
most of us still authenticate through a _single_ factor, _something we have_:
our session cookies. If anyone gets a hold of my computer, the game is up for
much more obvious reasons than "they might get a hold of my 2FA secret". They'll
simply have access to all of my currently logged in sessions. It makes no
difference whether you dilligently use a different password for every service.

Maybe that's another reason I give particularly little heed to the claim that
"having your tokens live on your computer defeats the point". Two factor
authentication _cannot_ and _was never meant to_ protect against people getting
hold of your computer. It's meant to protect against people getting hold of your
_password_.

[^1]: [HTTP Strict-Transport-Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security) (HSTS)
is an HTTP header that tells the browser to _always_ upgrade the connection to 
HTTPS in the future. This is cool, but it still leaves 
the very first visit open to man-in-the-middle attacks. Browsers ship with a 
pre-defined lists of domains, the so-called _HSTS preload_ list, such that even
that very first visit will be forced to go over HTTPS. Clearly, this is
completely overkill for a static content website such as this one, and we can
hardly expect to ship _every single domain on the internet_ with the binary. I
wrote more about HSTS and the attacks it's meant to prevent [in a previous
post](./ssl-strip).

[^2]:Save, perhaps, through Hollywood-esque surgical means.

[^3]:For the purposes of this article, I will consider 6-digit [TOTP](https://www.rfc-editor.org/rfc/rfc6238) codes,
like the ones generated through Authy or Google Authenticator.

[^4]:That is, of course, unless you've memorized the token and are generating 
your OTP codes on the fly. In which case, _good for you_.
