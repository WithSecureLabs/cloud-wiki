# WorkSpaces



## Service Details

Amazon WorkSpaces enables you to provision virtual, cloud-based Microsoft Windows, Amazon Linux, or Ubuntu Linux desktops for your users, known as WorkSpaces. WorkSpaces eliminates the need to procure and deploy hardware or install complex software. You can quickly add or remove users as your needs change. Users can access their virtual desktops from multiple devices or web browsers.

## Assessment Notes


## Operational Notes

### Authentication
 
 WorkSpaces requires integration with some form of active directory (AD) to store users and WorkSpace machines. There are currently three available methods for this:

* AWS Managed Microsoft AD
* Simple AD
* AD Connector

Once a user has been added to AD they can be paired with a WorkSpace machine. WorkSpaces will send a unique code to the users registered email address, which they can enter into the WorkSpaces client.

### WorkSpaces Client

The WorkSpaces client is available for the vast majority of modern devices:

* Windows
* MacOS
* Linux
* Ipad
* Android/Chromebook
* Fire Tablet

A web client is also available for use if you don't want to install anything.

The download page for the client can be found [here](https://clients.amazonworkspaces.com/)


![image](/img/aws_images/workspaces_client.png)

Once download a user can enter their WorkSpaces invite code, they can then proceed to enter their username and password as stored in AD.




### Useful CLI Commands

```

## External Links
