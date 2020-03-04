import React, { useEffect, useState } from 'react'
import TalkListItem from './TalkListItem'
import { useDispatch, useSelector } from 'react-redux'
import { getSpeakersListSelector } from '../../../core/speakers/speakerSelectors'
import Grid from '@material-ui/core/Grid'
import OFListHeader from '../../baseComponents/layouts/OFListHeader'
import {
    getFilteredTalksAsMapSelector,
    getTalksFilterSelector,
} from '../../../core/talks/talksSelectors'
import { setTalksFilter } from '../../../core/talks/talksActions'
import { hideVote, unhideVote } from './moderationActions'
import {
    getTextVotesSelector,
    isTextVotesLoadedSelector,
} from './moderationSelectors'
import Typography from '@material-ui/core/Typography'
import { useTranslation } from 'react-i18next'
import LoaderMatchParent from '../../../baseComponents/customComponent/LoaderMatchParent'
import SimpleDialog from '../../baseComponents/layouts/SimpleDialog'
import TranslatedTypography from '../../baseComponents/TranslatedTypography'
import { VOTE_STATUS_ACTIVE, VOTE_STATUS_HIDDEN } from '../../../core/contants'
import OFPagination from '../../baseComponents/layouts/OFPagination'

const itemPerPage = 10
const TalkList = () => {
    const dispatch = useDispatch()
    const talks = useSelector(getFilteredTalksAsMapSelector)
    const votesWithTalkId = useSelector(getTextVotesSelector)
    const filter = useSelector(getTalksFilterSelector)
    const speakersMap = useSelector(getSpeakersListSelector)
    const isVotesLoaded = useSelector(isTextVotesLoadedSelector)
    const { t } = useTranslation()

    const [currentPage, setPage] = useState(1)
    const [selectedVote, setSelectedVote] = useState(null)
    const [changingVote, setChangingVote] = useState(null)
    const [isVoteStatusChanging, setVoteStatusChange] = useState(false)

    const talkKeys = Object.keys(votesWithTalkId)
    const selectedKeys = talkKeys.slice(
        (currentPage - 1) * itemPerPage,
        (currentPage - 1) * itemPerPage + itemPerPage
    )

    const isChangingVoteHide =
        changingVote && changingVote.status === VOTE_STATUS_ACTIVE

    const movePage = newPage => {
        setPage(newPage)
    }

    useEffect(() => {
        return () => {
            dispatch(setTalksFilter(null))
        }
    }, [dispatch])

    if (!isVotesLoaded) {
        return <LoaderMatchParent height="200px" />
    }

    return (
        <Grid container>
            <OFListHeader
                filterValue={filter}
                filterChange={value => dispatch(setTalksFilter(value))}
            />

            {selectedKeys.map(talkId => {
                if (!talks[talkId]) {
                    return ''
                }

                return (
                    <TalkListItem
                        talk={talks[talkId]}
                        key={talkId}
                        speakers={speakersMap}
                        votes={votesWithTalkId[talkId]}
                        onSpeakerClicked={value =>
                            dispatch(setTalksFilter(value))
                        }
                        onVoteExpandClick={setSelectedVote}
                        onVoteHideClick={setChangingVote}
                    />
                )
            })}

            <OFPagination
                count={talkKeys ? Math.ceil(talkKeys.length / itemPerPage) : 0}
                current={currentPage}
                onChange={(event, page) => movePage(page)}
            />

            <SimpleDialog
                onClose={() => setSelectedVote(null)}
                onConfirm={() => setSelectedVote(null)}
                title={'Vote ' + (selectedVote && selectedVote.voteId)}
                confirmText={t('common.close')}
                open={!!selectedVote}>
                <Typography>{selectedVote && selectedVote.text}</Typography>
            </SimpleDialog>

            <SimpleDialog
                onClose={() => {
                    setChangingVote(null)
                    setVoteStatusChange(false)
                }}
                onConfirm={async () => {
                    setVoteStatusChange(true)
                    if (changingVote.status === VOTE_STATUS_HIDDEN) {
                        await dispatch(unhideVote(changingVote))
                    } else {
                        await dispatch(hideVote(changingVote))
                    }
                    setChangingVote(null)
                    setVoteStatusChange(false)
                }}
                title={t(
                    isChangingVoteHide
                        ? 'moderation.hideDialogTitle'
                        : 'moderation.unhideDialogTitle'
                )}
                confirmText={t(
                    isChangingVoteHide
                        ? 'moderation.hideDialogTitle'
                        : 'moderation.unhideDialogConfirm'
                )}
                cancelText={t('common.cancel')}
                open={!!changingVote}
                confirmLoading={isVoteStatusChanging}>
                <TranslatedTypography
                    i18nKey={
                        isChangingVoteHide
                            ? 'moderation.hideDialogDescription'
                            : 'moderation.unhideDialogDescription'
                    }
                />
            </SimpleDialog>
        </Grid>
    )
}

export default TalkList