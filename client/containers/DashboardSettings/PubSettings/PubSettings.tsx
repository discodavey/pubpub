import React from 'react';
import { Button, Tooltip } from '@blueprintjs/core';

import {
	Icon,
	DatePicker,
	DownloadChooser,
	SettingsSection,
	ImageUpload,
	InputField,
	PubAttributionEditor,
	PubCollectionsListing,
	FacetEditor,
} from 'components';
import { apiFetch } from 'client/utils/apiFetch';
import { slugifyString } from 'utils/strings';
import { usePageContext, usePendingChanges } from 'utils/hooks';
import { getDashUrl } from 'utils/dashboard';
import { pubUrl } from 'utils/canonicalUrls';
import { usePersistableState } from 'client/utils/usePersistableState';

import DeletePub from './DeletePub';
import Doi from './Doi';
import DashboardSettingsFrame, { Subtab } from '../DashboardSettingsFrame';

type Props = {
	settingsData: {
		pubData: any;
	};
};

const PubSettings = (props: Props) => {
	const { settingsData } = props;
	const { scopeData, communityData } = usePageContext();
	const { pendingPromise } = usePendingChanges();
	const {
		activePermissions: { canAdminCommunity, canManage },
	} = scopeData;

	const {
		state: pubData,
		hasChanges,
		update: updatePubData,
		updatePersistedState: updatePersistedPubData,
		persistedState: persistedPubData,
		persist,
	} = usePersistableState(settingsData.pubData, async (update) => {
		await pendingPromise(apiFetch.put('/api/pubs', { pubId: pubData.id, ...update }));
		if (update.slug && update.slug !== settingsData.pubData.slug) {
			window.location.href = getDashUrl({
				pubSlug: update.slug,
				mode: 'settings',
			});
		}
	});

	const renderDetails = () => {
		return (
			<React.Fragment>
				<SettingsSection title="Details" showTitle={false}>
					<InputField
						label="Title"
						value={pubData.title}
						onChange={(evt) => updatePubData({ title: evt.target.value })}
						error={!pubData.title ? 'Required' : null}
					/>
					<InputField
						label="Link"
						helperText={`Pub will be available at ${pubUrl(communityData, pubData)}`}
						value={pubData.slug}
						onChange={(evt) => updatePubData({ slug: slugifyString(evt.target.value) })}
						error={!pubData.slug ? 'Required' : null}
					/>
					<InputField
						label="Custom publication date"
						helperText="If set, this will be shown instead of the first Release date."
					>
						<DatePicker
							// @ts-expect-error ts-migrate(2322) FIXME: Type '{ style: { width: number; }; date: any; onSe... Remove this comment to see the full error message
							style={{ width: 200 }}
							date={pubData.customPublishedAt}
							onSelectDate={(date) =>
								updatePubData({ customPublishedAt: date && date.toUTCString() })
							}
						/>
					</InputField>
					<InputField
						label="Description"
						placeholder="Enter description"
						helperText={`${(pubData.description || '').length}/280 characters`}
						isTextarea={true}
						value={pubData.description || ''}
						onChange={(evt) =>
							updatePubData({
								description: evt.target.value.substring(0, 280).replace(/\n/g, ' '),
							})
						}
						error={undefined}
					/>
					<ImageUpload
						htmlFor="avatar-upload"
						label={
							<span>
								Preview Image
								<Tooltip
									content={
										<span>
											Image to be associated with this pub when it is shown in{' '}
											<br />
											other pages as part a preview link or in a listing of
											pubs.
										</span>
									}
									// @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: Element; content: Element; toolt... Remove this comment to see the full error message
									tooltipClassName="bp3-dark"
								>
									<Icon icon="info-sign" />
								</Tooltip>
							</span>
						}
						canClear={true}
						key={pubData.avatar}
						defaultImage={pubData.avatar}
						onNewImage={(value) => updatePubData({ avatar: value })}
						width={150}
						helperText={
							<span>
								Suggested minimum dimensions: <br />
								1200px x 800px
							</span>
						}
					/>
					<Button
						disabled={pubData.avatar === pubData.headerBackgroundImage}
						onClick={() => updatePubData({ avatar: pubData.headerBackgroundImage })}
					>
						Use header image as preview
					</Button>
				</SettingsSection>
			</React.Fragment>
		);
	};

	const renderLicense = () => {
		return <FacetEditor facetName="License" />;
	};

	const renderTheme = () => {
		return <FacetEditor facetName="PubHeaderTheme" />;
	};

	const renderCitationChooser = () => {
		return <FacetEditor facetName="CitationStyle" />;
	};

	const renderDoi = () => {
		return (
			<SettingsSection title="DOI" showTitle={false}>
				<Doi
					pubData={persistedPubData}
					communityData={communityData}
					updatePubData={updatePersistedPubData}
					canIssueDoi={canAdminCommunity}
				/>
			</SettingsSection>
		);
	};

	const renderAttributions = () => {
		return (
			<SettingsSection title="Attributions" showTitle={false}>
				<PubAttributionEditor
					pubData={pubData}
					communityData={communityData}
					updatePubData={updatePersistedPubData}
					canEdit={canManage}
				/>
			</SettingsSection>
		);
	};

	const renderFormattedDownload = () => {
		return (
			<SettingsSection
				title="Download"
				description={
					<>
						You can add a file that users can download for this Pub, in addition to the
						ones that PubPub automatically generates.
					</>
				}
			>
				<DownloadChooser
					pubData={pubData}
					communityId={communityData.id}
					onSetDownloads={(downloads) => updatePersistedPubData({ downloads })}
				/>
			</SettingsSection>
		);
	};

	const renderCollections = () => {
		return (
			<SettingsSection title="Collections" showTitle={false}>
				<PubCollectionsListing
					pub={pubData}
					allCollections={communityData.collections}
					collectionPubs={pubData.collectionPubs}
					updateCollectionPubs={(nextCollectionPubs) =>
						updatePersistedPubData({ collectionPubs: nextCollectionPubs })
					}
					canManage={canManage}
				/>
			</SettingsSection>
		);
	};

	const renderDelete = () => {
		return (
			<SettingsSection title="Delete">
				<DeletePub communityData={communityData} pubData={pubData} />
			</SettingsSection>
		);
	};

	const renderNodeLabelEditor = () => {
		return <FacetEditor facetName="NodeLabels" />;
	};

	const renderConnectionsSettings = () => {
		return <FacetEditor facetName="PubEdgeDisplay" />;
	};

	const tabs: Subtab[] = [
		{
			id: 'details',
			title: 'Details',
			icon: 'settings',
			sections: [renderDetails, renderLicense, renderFormattedDownload, renderDelete],
		},
		{
			id: 'look-and-feel',
			title: 'Look & Feel',
			icon: 'tint',
			sections: [
				renderTheme,
				renderCitationChooser,
				renderNodeLabelEditor,
				renderConnectionsSettings,
			],
		},
		{
			id: 'contributors',
			title: 'Contributors',
			pubPubIcon: 'contributor',
			hideSaveButton: true,
			sections: [renderAttributions],
		},
		{
			id: 'collections',
			title: 'Collections',
			pubPubIcon: 'collection',
			hideSaveButton: true,
			sections: [renderCollections],
		},
		{
			id: 'doi',
			title: 'DOI',
			icon: 'barcode',
			hideSaveButton: true,
			sections: [renderDoi],
		},
	];

	return (
		<DashboardSettingsFrame
			tabs={tabs}
			id="pub-settings"
			hasChanges={hasChanges}
			persist={persist}
		/>
	);
};
export default PubSettings;
