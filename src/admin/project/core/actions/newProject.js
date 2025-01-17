import {
    ADD_PROJECT_ERROR,
    ADD_PROJECT_ONGOING,
    ADD_PROJECT_SUCCESS,
} from '../projectActionTypes'
import { getUserSelector } from '../../../auth/authSelectors'
import { fireStoreMainInstance, serverTimestamp } from '../../../../firebase'
import { newRandomHexColor } from '../../../../utils/colorsUtils'
import { addNotification } from '../../../notification/notifcationActions'
import { trackNewProject } from '../../../utils/track'
import { NO_ORGANIZATION_FAKE_ID } from '../../../organization/core/organizationConstants'
import { getOrganization } from '../../../organization/core/actions/getOrganization'

export const newProject =
    (organizationId, projectId, projectData, useOrganizationSettings = true) =>
    async (dispatch, getState) => {
        dispatch({
            type: ADD_PROJECT_ONGOING,
        })

        projectData.owner = getUserSelector(getState()).uid
        projectData.members = [projectData.owner]
        projectData.createdAt = serverTimestamp()
        projectData.chipColors = [newRandomHexColor()]
        projectData.favicon = `${window.location.protocol}//${window.location.host}/favicon-32x32.png`
        projectData.logoSmall = `${window.location.protocol}//${window.location.host}/android-chrome-192x192.png`
        projectData.hideVotesUntilUserVote = false

        if (
            organizationId !== NO_ORGANIZATION_FAKE_ID &&
            useOrganizationSettings
        ) {
            const organization = await dispatch(getOrganization(organizationId))
            if (organization) {
                projectData.organizationId = organizationId
                projectData.chipColors = organization.chipColors
                projectData.favicon = organization.favicon
                projectData.logoSmall = organization.logoSmall
                projectData.voteItems = organization.voteItems
                projectData.languages = organization.languages
                projectData.disableSoloTalkRedirect =
                    organization.disableSoloTalkRedirect
                projectData.hideVotesUntilUserVote =
                    organization.hideVotesUntilUserVote || false
            }
        }

        return await fireStoreMainInstance
            .collection('projects')
            .doc(projectId)
            .set(projectData)
            .then(() => {
                dispatch(
                    addNotification({
                        type: 'success',
                        i18nkey: 'project.newSuccess',
                    })
                )
                dispatch({
                    type: ADD_PROJECT_SUCCESS,
                    payload: projectId,
                })
                trackNewProject(
                    projectData.name,
                    projectData.setupType,
                    organizationId
                )
                return projectId
            })
            .catch((err) => {
                dispatch(
                    addNotification({
                        type: 'error',
                        i18nkey: 'project.newFail',
                        message: err.toString(),
                    })
                )
                dispatch({
                    type: ADD_PROJECT_ERROR,
                    payload: err.toString(),
                })
            })
    }
