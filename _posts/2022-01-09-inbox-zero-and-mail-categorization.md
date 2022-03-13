---
title: Inbox zero and mail categorization
tags: DIY-Productivity
---

1. TOC
{:toc}

## Purpose

I have read a lot of articles on reaching Inbox zero and iterated on several versions of how I want to manage my inbox. Based on my learnings and iterations I am sharing my system of how I manage my emails and manage to get to `Inbox 0` every day with 4 mail ids.

I won't delve into the philosophy of why you need Inbox zero or how it can help. I am assuming that you already want to get to Inbox zero and you are just looking for a system to achieve that.

Let me preface this article by mentioning a few important things:

1. I am not an ultra-busy person who receives 100s of emails every day.
2. While on the path to Inbox zero, categorization of mails help. I do it because of my love of organizing stuff.
3. I use Gmail. My system works on Gmail, but I haven't tested it on other mail providers.
4. This article is going to be action-oriented.

## General principles

1. Most of the work should be automated
2. Don't lose emails permanently
3. Auto categorization helps

## System

This goes without saying, if you want inbox zero, unsubscribe from all the unnecessary newsletters and marketing updates. It's a nice start to reduce the overhead for unnecessary mails.

Another thing to keep in mind is that don't check your emails every hour. Set aside some time to check them and reply. I usually do it before lunch and after dinner. Also, no one (*should*) expects instant replies to emails. That's why instant messaging apps like Whatsapp exists.

### Use filters

Read [this](https://support.google.com/mail/answer/6579?hl=en) on how to create them in Gmail.

I use filters in Gmail heavily to move my mails directly to Archive (where they stay for eternity) neatly categorized into broad categories automatically. 95% of my mails are auto categorized using these filters. These are usually just updates or transaction mails that I don't need to look at every day but need to keep for the record.

Most of the mails I receive falls into these broad categories

- Bills and receipts (Utility bills, Subscription receipts, etc.)
- Shopping updates (Delivery, Amazon, etc.)
- Bank and investment updates (Credit & debit mails, investments to mutual funds, stocks, etc.)
- Newsletters

I have created a filter for each category

- Each filter contains some pre-defined configuration
- I have added predefined domains that fall into each category. For example All mails from `@amazon.in` fall into the Shopping category
- I have added additional action based on the category. For example, I mark all mails in Shopping as read and move them to Archive automatically so that they don't clutter my inbox
- My Shopping filter looks something like this

- ```text
    Matches: from:(@amazon.in OR @amazon.com OR @flipkart.com OR @myntra.com OR @cashkaro.com OR @dominos.co.in OR @reliancedigital.in)

    Do this: Skip Inbox, Mark as read, Apply label "Shopping"
    ```

- This filter is based on the assumption that we rarely need to read every shopping update.
- I have similar filters for other categories like Reading List (for newsletters), Investments (from my stock broker), Subscriptions (form Netflix, Hotstar etc.).
- Based on the category I sometimes configure the filter to move the mail to their category but keep them as unread. This can be useful for some important emails eg: Mails from banks.
- Creating these filters will take some time, but in the long run, they will auto categorize most of your mails and move them away from your inbox
- Remember to keep updating the filter addresses as you start using more and more services

### Use snooze

Read about the snooze feature in Gmail [here](https://support.google.com/mail/answer/7622010?hl=en&co=GENIE.Platform%3DDesktop).

The filters take care of 95% of my emails. For the rest of my mails, I do either of these things:

- If I have to spend a lot of time in the mail (eg: Reading newsletter or get some work done before replying), I snooze the mail to resurface at an appropriate time.
  - For example, I snooze all the newsletters that I receive to weekend and read them in one go
- If it needs to be read and no action is required, I archive it. If it should have already been categorized and archived, I would update the relevant filter as well.
- For the rest of the emails, I can choose to reply then and there. If I don't want to send the mail at that instant, I will schedule it.
- The gist here is to use the Snooze feature heavily to resurface the mail again in the future when you need it or when you are ready to deal with it. Keep your Inbox tidy!

## Final notes

Following these two practices helps me keep my Inbox clean and organized. I agree that configuring filters is a one-time manual effort but it has a great return on investment on time spent in configuring them.

The snooze feature is also available on the mobile Gmail app. But filter feature is not developed in the app. So I would recommend setting filters in a desktop browser.

Setting snooze configuration in filters is something that I am looking forward to so that I can automatically snooze my newsletters to weekends.

Last note, once in a while, look at your auto categorized emails that are moved to Archive so that you know that you are not missing any important mails via these filters.

Here’s a snapshot of mails that are auto categorized by filters and moved to Archive.

![image](/assets/images/emails.jpeg)

## Reference

- I was inspired to write this article after reading one by Dr. Devi Parikh [here](https://deviparikh.medium.com/checking-email-to-inbox-zero-e00d478cdd4b)
