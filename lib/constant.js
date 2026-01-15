// 検索用キーワード
export const keywords = [
  {
    name: "Java",
    re: /Java(?!Script)/gim,
  },
  {
    name: "JSP",
    re: /JSP/gim,
  },
  {
    name: "Spring",
    re: /Spring/gim,
  },
  {
    name: "JavaScript",
    re: /JavaScript/gim,
  },
  {
    name: "TypeScript",
    re: /TypeScript/gim,
  },
  {
    name: "Node.js",
    re: /Node\.js/gim,
  },
  {
    name: "React",
    re: /React/gim,
  },
  {
    name: "Vue",
    re: /Vue/gim,
  },
  {
    name: "Python",
    re: /Python/gim,
  },
  {
    name: "Ruby",
    re: /Ruby/gim,
  },
  {
    name: "PHP",
    re: /PHP/gim,
  },
  {
    name: "C",
    re: /C(?:言語|!\+\+)/gim,
  },
  {
    name: "C++",
    re: /C\+\+/gim,
  },
  {
    name: "C#",
    re: /C#/gim,
  },
  {
    name: "Swift",
    re: /Swift/gim,
  },
  {
    name: "Kotlin",
    re: /Kotlin/gim,
  },
  {
    name: "HTML",
    re: /HTML/gim,
  },
  {
    name: "CSS",
    re: /CSS/gim,
  },
  {
    name: "SQL",
    re: /(!PL\/)SQL/gim,
  },
  {
    name: "Oracle",
    re: /Oracle/gim,
  },
  {
    name: "PL/SQL",
    re: /PL\/SQL/gim,
  },
  {
    name: "Microsoft SQL Server",
    re: /(MS|Microsoft)\s*SQL\s*Server/gim,
  },
  {
    name: "Transact-SQL",
    re: /(T\-|Transact\-)SQL/gim,
  },
  {
    name: "DB2",
    re: /DB2/gim,
  },
  {
    name: "PostgreSQL",
    re: /PostgreSQL/gim,
  },
  {
    name: "MySQL",
    re: /MySQL/gim,
  },
  {
    name: "MongoDB",
    re: /MongoDB/gim,
  },
  {
    name: "Redis",
    re: /Redis/gim,
  },
  {
    name: "Elasticsearch",
    re: /Elasticsearch/gim,
  },
  {
    name: "Docker",
    re: /Docker/gim,
  },
  {
    name: "Kubernetes",
    re: /Kubernetes/gim,
  },
  {
    name: "AWS",
    re: /AWS/gim,
  },
  {
    name: "Azure",
    re: /Azure/gim,
  },
  {
    name: "GCP",
    re: /(GCP|Google[ ]+Cloud[ ]+Platform)/gim,
  },
  {
    name: "要件定義",
    re: /要件定義/gim,
  },
  {
    name: "基本設計",
    re: /基本設計/gim,
  },
  {
    name: "詳細設計",
    re: /詳細設計/gim,
  },
  {
    name: "テスト",
    re: /テスト/gim,
  },
];

// 抽出用キーワード
export const extractions = [
  {
    name: "案件名称",
    re: /^\s*案\s*件\s*名\s*称*[:：\s\n]+(.+)/gim,
    num: [1],
    multiLine: false,
  },
  {
    name: "案件内容",
    re: /^\s*(?:案\s*件|業\s*務|作\s*業)*\s*(?:内\s*容|概\s*要)[:：\s\n]+((\S+\n*\s*。*){1,5})\n(^!(\s+(!・)+\s+)((・\S+\n)))*/gim,
    num: [1, 3],
    multiLine: true,
  },
  {
    name: "募集人数",
    re: /^\s*(?:募\s*集|作\s*業|人\s*数)+[:：\s\n]+(.+)/gim,
    num: [1],
    multiLine: false,
  },
  {
    name: "作業期間",
    re: /^\s*(?:作\s*業|稼\s*働)*\s*期\s*間[:：\s\n]+(.+)/gim,
    num: [1],
    multiLine: false,
  },
  {
    name: "作業場所",
    re: /^\s*(?:作\s*業|!説\s*明)*\s*場\s*所[:：\s\n]+(.+)/gim,
    num: [1],
    multiLine: false,
  },
  {
    name: "精算",
    re: /^\s*精\s*算[\s:：\n]+(.+)/gim,
    num: [1],
    multiLine: false,
  },
  {
    name: "単価",
    re: /^\s*単\s*価[\s:：\n]+(.+)/gim,
    num: [1],
    multiLine: false,
  },
];
