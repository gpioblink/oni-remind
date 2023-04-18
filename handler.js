const https = require('https')
const dayjs = require('dayjs')
const yaml = require('js-yaml')
const fs = require('fs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const isSameOrAfter = require('dayjs/plugin/isSameOrAfter')
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore')
const isBetween = require('dayjs/plugin/isBetween')
const axios = require('axios')

const workDir = process.env.GITHUB_WORKSPACE || process.env.PWD

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)
dayjs.extend(isBetween)
dayjs.tz.setDefault("Asia/Tokyo")

exports.handler = async (event) => {
  // parse config
  const methods = yaml.load(fs.readFileSync(`${workDir}/config/notification-methods.yml`, 'utf8'));
  const reminders = yaml.load(fs.readFileSync(`${workDir}/config/reminders.yml`, 'utf8')); 

  // parse methods
  for (let [key, value] of Object.entries(reminders['reminders'])) {
    console.log(`start sending reminder for ${key}`);
    if(methods['methods'][value['method']].provider !== "slack-webhook") {
      console.log("currently only slack-webhook is supported, skip");
      continue;
    }

    // to avoid hooks url expose, add mask
    console.log(`::add-mask::${methods['methods'][value['method']].url}`)

    runSlackReminder(value['repo'], methods['methods'][value['method']].url, event.type);
  }
  
  const response = {
    statusCode: 200,
    body: JSON.stringify('oni-remind: Script executed.'),
  };
  return response
}

const runSlackReminder = async (repo, url, eventType) => {
  // make issue url from repo name
  const githubIssueUrl = `https://api.github.com/repos/${repo}/issues?state=open`

  // get issues from github
  const issuesRaw = await axios.get(githubIssueUrl, {
    headers: {
      Authorization: `token ${process.env.GH_PAT}`,
    }
  })
  
  await Promise.all(issuesRaw.data.map(issue => {
    // タイトルの先頭の時間をDate型に直す。時間はひとまず09:00固定で。
    const title = issue.title
    const matchTime = title.match(/\d{1,2}\/\d{1,2}/)

    if(matchTime === null) { return }

    // 日付が切れてたら来年に+1する
    let issueDueTime = dayjs(`${dayjs().year()}/${matchTime}`, "YYYY/MM/DD")
    issueDueTime = issueDueTime.add(21, 'h')
    if (issueDueTime.isSameOrBefore(dayjs().add(-5, 'd'))) {
      issueDueTime = issueDueTime.add(1, 'y')
    }

    const issueData = {
      title: issue.title,
      url: issue.html_url,
      date: issueDueTime
    }

    if(eventType === "deadline") {
      // 1日前
      if (issueData.date.isBetween(dayjs(), dayjs().add(1.5, 'd'))) {
        return postMessageToSlack(`「${issueData.title}」は、1日後の${issueData.date.format("YYYY/MM/DD")}で期限切れるぞ！！ 終わってないならすぐやろう\n${issueData.url}\n`, url)
      }

      // 3日前
      if (issueData.date.isBetween(dayjs().add(2, 'd'), dayjs().add(3.5, 'd'))) {
        return postMessageToSlack(`「${issueData.title}」は、3日後の${issueData.date.format("YYYY/MM/DD")}で期限切れるぞ！！ やってる？\n${issueData.url}\n`, url)
      }

      // 7日前
      if (issueData.date.isBetween(dayjs().add(6, 'h'), dayjs().add(7.5, 'h'))) {
        return postMessageToSlack(`「${issueData.title}」は、7日後の${issueData.date.format("YYYY/MM/DD")}で期限切れるぞ！！ 注意！！\n${issueData.url}\n`, url)
      }
    } else if(eventType === "expired") {
      // 期限切れ
      if (issueData.date.isSameOrBefore(dayjs())) {
        return postMessageToSlack(`【期限切れ】「${issueData.title}」は、${issueData.date.format("YYYY/MM/DD")}で期限切れてるぞ！！ はよやれ！！\n${issueData.url}\n`, url)
      }
      
      // 3時間~4時間前
      if (issueData.date.isBetween(dayjs().add(3, 'h'), dayjs().add(4.5, 'h'))) {
        return postMessageToSlack(`【締切間近】「${issueData.title}」は、3時間後の${issueData.date.format("YYYY/MM/DD")}で期限切れるぞ！！ 終わってないならすぐやろう\n${issueData.url}\n`, url)
      }
    }

  }));
}

const postMessageToSlack = async (text, url) => {
  await axios.post(url, {
    "text": text
  })
}