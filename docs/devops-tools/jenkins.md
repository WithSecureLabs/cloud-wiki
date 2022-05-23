# Jenkins

CI/CD tool - very popular, with a history of RCE and other high risk vulns being found in it. Common to find issues with specific plugins, too, and because of the way jenkins operates it's very common to be able to leverage medium web app vulns such as CSRF and XSS into RCE by hitting a user with access to the jenkins script console.

## Assessing a Jenkins Deployment

* Check version for known vulnerabilities
* Check plugins for vulns - see scripts section to get a list of all plugins and their versions
* Jenkins management console
  * Is the "enable security" checkbox (enables auth) ticked?
  * How are they managing auth? If AD/Google Login/LDAP etc, what permissions are needed to get access to Jenkins?
  * Review the auth model - matrix-based is a minimum, project-based matrix is better
  * Review the auth matrix to ensure that the permissions model makes sense for their userbase and security model. Sensitive ones include:
    * Overall/Administer
    * Overall/RunScripts
      * Overall/UploadPlugins
      * ConfigureUpdateCenter
  * Is the CLI disabled?
    * Manage Jenkins > Configure Global Security > Agent protocols, disable the CLI protocols
* Build slaves, sometimes known as nodes, should be used, rather than running builds on the jenkins master
  * Builds running on the master == code execution on the system with all the credentials for anyone with rights to create a build job
* Check TLS
* Check if it's running as root - it shouldn't be
* Usual host build review stuff for Windows/Linux

## Useful Exploits

### Metasploit Modules

* Jenkins <= 2.150.2 Remote Command Execution via Node JS
* Jenkins CLI HTTP Java Deserialization Vulnerability / remoting module in Jenkins before 2.32 and LTS before 2.19. / CVE-2016-9299
* Jenkins XStream Groovy classpath Deserialization Vulnerability / Jenkins versions older than 1.650 and Jenkins LTS versions older than 1.642.2 / CVE-2016-0792
* Jenkins CLI RMI Java Deserialization Vulnerability / Jenkins 1.637 / CVE-2015-8103

### Other

* Chain CVE-2019-1003000 and CVE-2018-1999002 to get unauthenticated RCE - <https://www.exploit-db.com/exploits/46453> - Vulnerable Plugins:
  * Pipeline: Declarative Plugin up to and including 1.3.4
  * Pipeline: Groovy Plugin up to and including 2.61
  * Script Security Plugin up to and including 1.49
* Jenkins version 2.32.1 - unauth code exec - <https://www.exploit-db.com/exploits/41965>

## Other Useful Tooling

### Metasploit

Metasploit includes a module for command execution through the script console, if available to you - `Jenkins Script-Console Java Execution`

### Jenkins Attack Framework

<https://github.com/Accenture/jenkins-attack-framework>

Some of the things you can do:

* **AccessCheck:** Test credentials and provide a rough overview of their access levels
* **ConsoleOutput:** Dump the console output of the last build of every job on the server (Can be Gigabytes of data, but good for finding credentials)
* **CreateAPIToken:** Creates an API Token for the current user (Or another user if you have administrative credentials)
* **DeleteAPIToken:** Deletes an API Token for the current user (Or another user if you have administrative credentials. Lists existing ones if no token supplied)
* **DeleteJob:** Delete a Job, or failing that, attempt a number of follow-up mitigations from most-to-least effective.
* **DumpCreds:** Dump credentials (Uses administrative credentials to dump credentials via Jenkins Console)
* **DumpCredsViaJob:** Dump credentials via job creation and explicit enumeration (User needs at least Add Job permissions)
* **ListAPITokens:** List existing API tokens for the current user (Or another user if you have administrative credentials)
* **ListJobs:** List existing Jenkins Jobs (Good For finding specific jobs)
* **RunCommand:** Run system command and get output/errors back (Uses administrative credentials and Jenkins Console)
* **RunJob:** Upload a script and run it as a job.  Also run "Ghost Jobs" that don't terminate or show up in Jenkins (after launch)
* **RunScript:** Run Groovy scripts (Uses administrative credentials to run a Groovy Script via Jenkins Console)
* **UploadFile:** Upload a file (Uses administrative credentials and chunked uploading via Jenkins Console)
* **WhoAmI:** Get the credentialed user's Jenkins groups (Usually contains their domain groups)

### Groovy Scripts

The following Groovy scripts can be executed within the Jenkins script console.

Recover masterkey, hudson secret and credentials.xml

```groovy
File credxml = new File("/path/to/jenkins/credentials.xml")
File mkey = new File("/path/to/jenkins/master.key")
File husecret = new File("/path/to/jenkins/hudson.util.secret")
println "MasterKey:\n ${mkey.bytes.encodeBase64()}\n\n HudsonSecret:\n${husecret.bytes.encodeBase64()}\n\n CredXML:\n${credxml.text}
```

Decrypt secrets from credentials.xml, if run within Jenkins

```groovy
println(hudson.util.Secret.decrypt("SECRETVALUE"))
```

Dump list of jenkins plugins and versions:

```groovy
Jenkins.instance.pluginManager.plugins.each{
  plugin ->
    println ("${plugin.getDisplayName()} (${plugin.getShortName()}): ${plugin.getVersion()}")
}
```

## External Content

* [https://www.crowdstrike.com/blog/your-jenkins-belongs-to-us-now-abusing-continuous-integration-systems/](https://www.crowdstrike.com/blog/your-jenkins-belongs-to-us-now-abusing-continuous-integration-systems/)
* [http://carnal0wnage.attackresearch.com/2019/02/jenkins-master-post.html](http://carnal0wnage.attackresearch.com/2019/02/jenkins-master-post.html)
