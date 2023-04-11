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

const githubIssueUrl = "https://api.github.com/repos/gpioblink/todo/issues?state=open"

const workDir = process.env.GITHUB_WORKSPACE || process.env.PWD

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)
dayjs.extend(isBetween)
dayjs.tz.setDefault("Asia/Tokyo")

exports.handler = async (event) => {
  // parse config
  try {
    const methods = yaml.load(fs.readFileSync(`${workDir}/config/notification-methods.yml`, 'utf8'));
    const reminders = yaml.load(fs.readFileSync(`${workDir}/config/reminders.yml`, 'utf8'));
    console.log(methods);
    console.log(reminders); 
  } catch (e) {
    console.log(e);
  }

  // // get issues from github
  // const issuesRaw = await axios.get(githubIssueUrl)
  
  // await Promise.all(issuesRaw.data.map(issue => {
  //   // タイトルの先頭の時間をDate型に直す。時間はひとまず09:00固定で。
  //   const title = issue.title
  //   const matchTime = title.match(/\d{1,2}\/\d{1,2}/)

  //   if(matchTime === null) { return }

  //   // 日付が切れてたら来年に+1する
  //   let issueDueTime = dayjs(`${dayjs().year()}/${matchTime}`, "YYYY/MM/DD")
  //   issueDueTime = issueDueTime.add(21, 'h')
  //   if (issueDueTime.isSameOrBefore(dayjs().add(-5, 'd'))) {
  //     issueDueTime = issueDueTime.add(1, 'y')
  //   }

  //   const issueData = {
  //     title: issue.title,
  //     url: issue.html_url,
  //     date: issueDueTime
  //   }

  //   // 1日前
  //   if (issueData.date.isBetween(dayjs(), dayjs().add(1.5, 'd'))) {
  //     return postMessageToSlack(`「${issueData.title}」は、1日後の${issueData.date.format("YYYY/MM/DD")}で期限切れるぞ！！ 終わってないならすぐやろう\n${issueData.url}\n`)
  //   }

  //   // 3日前
  //   if (issueData.date.isBetween(dayjs().add(2, 'd'), dayjs().add(3.5, 'd'))) {
  //     return postMessageToSlack(`「${issueData.title}」は、3日後の${issueData.date.format("YYYY/MM/DD")}で期限切れるぞ！！ やってる？\n${issueData.url}\n`)
  //   }

  //   // 7日前
  //   if (issueData.date.isBetween(dayjs().add(6, 'h'), dayjs().add(7.5, 'h'))) {
  //     return postMessageToSlack(`「${issueData.title}」は、7日後の${issueData.date.format("YYYY/MM/DD")}で期限切れるぞ！！ 注意！！\n${issueData.url}\n`)
  //   }

  // }));
  
  const response = {
    statusCode: 200,
    body: JSON.stringify('oni-remind: Script executed.'),
  };
  return response
}

const postMessageToSlack = async (text) => {
  await axios.post(url, {
    "text": text
  })
}