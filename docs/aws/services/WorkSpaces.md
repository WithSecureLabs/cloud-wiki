# WorkSpaces



## Service Details

Amazon WorkSpaces enables you to provision virtual, cloud-based Microsoft Windows, Amazon Linux, or Ubuntu Linux desktops for your users, known as WorkSpaces. WorkSpaces eliminates the need to procure and deploy hardware or install complex software. You can quickly add or remove users as your needs change. Users can access their virtual desktops from multiple devices or web browsers.

## Assessment Notes

* When syncing WorkSpaces with any Active Directory, ensure users are being forced to set strong passwords.
* Policies should be put in place to ensure any clients on users systems are updated regularly.
* Ensure that any images in use by WorkSpaces are being updated regularly.
* IP Access Controls should always be in use, there isn't really a good excuse for not using these. If not in use all WorkSpaces within the account could be open to the world.
* The WorkSpaces client uses shared endpoints to communicate with AWS (*put example here*). This involves initial registration and authentication if you have strict data security requirements WorkSpaces may not be suitable.


## Operational Notes

### Authentication
 
 WorkSpaces requires integration with some form of active directory (AD) to store users and WorkSpace machines. There are currently three available methods for this:

* AWS Managed Microsoft AD
* Simple AD
* AD Connector

Once a user has been added to AD they can be paired with a WorkSpace machine. WorkSpaces will send a unique code to the users registered email address, which they can enter into the WorkSpaces client.

### Operating System Support

WorkSpaces is not capable of running a wade range of operating systems. As of Jan 2023, only Windows 10 and Amazon Linux 2 are supported.

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

#### WorkSpace Client Networking

When using the WorkSpaces client a certain list of ports must be opened for the connection to function correctly.

For the installed client, the following ports must be opened:

* 53 - DNS resolution
* 443 - Client application updates, registration and authentication
* 4172 and 4195 - Streaming the WorkSpace desktop and health checks

For the Web client, the following ports must be opened:

* 53 - DNS resolution
* 80 - This is used for the initial connection to workspace it is then switched to HTTPS
* 443 - Registration and authentication
* 4195 - Workspaces that are configured to use the Workspaces Streaming Protocol (WSP)
Note: A web browser will typically select a high port for streaming if WSP is not configured. You must ensure traffic can return to this port.

More information on the required ports and their functions can be found [here](https://docs.aws.amazon.com/workspaces/latest/adminguide/workspaces-port-requirements.html)

### Images/Bundles

WorkSpaces provides a way to template deployments with Images and bundles.

* A custom image contains only the OS, software, and settings for the WorkSpace. 

* A custom bundle is a combination of both that custom image and the hardware from which a WorkSpace can be launched.

After you create a custom image, you can build a custom bundle that combines the custom WorkSpace image and the underlying compute and storage configuration that you select. You can then specify this custom bundle when you launch new WorkSpaces to ensure that the new WorkSpaces have the same consistent configuration (hardware and software).

### IP Access Controls

WorkSpaces provides a method in which you can limit connections to your WorkSpace environments. Ideally this should always be enabled when using WorkSpaces to avoid exposing instances to the internet.

### Bring Your Own License (BYOL)

Out of the Box WorkSpaces does not have any way to automatically start using any Windows Licenses you may have from Microsoft. If you wish to start using this feature you must first create a support case with AWS support who will verify your eligibility.



### Useful CLI Commands

## External Links
