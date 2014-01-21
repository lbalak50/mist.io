@backends
Feature: Backends

    Background:
        #Given PhantomJS as the default browser
        #Given a browser
        Given "NinjaTester" as the persona
        When i visit mist.io
            Then I should see "mist.io"

    @web
    Scenario Outline: Add Backends
        When I click the "Add backend" button
        And I click the "Select provider" button
        And i click the "<provider>" button
        And I use my "<credentials>" credentials
        And I click the "Add" button
        And I wait for 1 seconds
            Then I should see the "<provider>" Backend added within 30 seconds

        Examples: Providers
        | provider          | credentials |
        | EC2 AP NORTHEAST  | EC2         |
        | Rackspace DFW     | RACKSPACE   |
        | OpenStack         | OPENSTACK   |
        | SoftLayer         | SOFTLAYER   |
        | NephoScale        | NEPHOSCALE  |
        | Linode            | LINODE      |
        | HP Cloud US East  | HPCLOUD     |


    @web
    Scenario: Disable Backend
        When I click the "OpenStack" button
        When I flip the backend switch
        And I click the "Back" button
            Then "OpenStack" backend should be "offline"


    @web
    Scenario: Enable Backend
        When I click the "OpenStack" button
        When I flip the backend switch
        And I click the "Back" button
        And I wait for 2 seconds
            Then "OpenStack" backend should be "online"

    @web
    Scenario Outline: Delete Backends
        When I click the "<provider>" button
        And I click the "Delete" button
        And I click the "Yes" button
            Then I should see the "<provider>" Backend deleted within 5 seconds

    Examples: Providers
    | provider          |
    | EC2 AP NORTHEAST  |
    | Rackspace DFW     |
    | OpenStack         |
    | SoftLayer         |
    | NephoScale        |
    | Linode            |
    | HP Cloud US East  |
    #Those are commented out cause we only need to test deleting one Backend
    #The db.yaml is refreshed to be empty in the next feature

#    @web
#    Scenario: Rename Backend
#        When I click the "OpenStack" button
#        And I wait for 2 seconds
#        And I change the name of the backend to "Renamed Backend"
#        And I wait for 2 seconds
#        And I click the "Back" button
#            Then I should see the "Renamed Backend" Backend added within 30 seconds