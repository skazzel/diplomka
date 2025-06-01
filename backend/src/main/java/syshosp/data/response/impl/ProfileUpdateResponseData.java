package syshosp.data.response.impl;

import syshosp.data.response.generic.AbstractGenericCodeResponseData;

public class ProfileUpdateResponseData extends AbstractGenericCodeResponseData
{
    public ProfileUpdateResponseData()
    {
        super(200, "Profile updated.");
    }
}
