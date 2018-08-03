import React from 'react';
import { storiesOf } from '@storybook/react';
import DashboardTags from 'components/DashboardTags/DashboardTags';
import { pubData, communityData } from '../data';

storiesOf('Components', module)
.add('DashboardTags', () => (
	<div className="pub-options-component">
		<div className="container right-column">
			<DashboardTags
				pubData={pubData}
				communityData={communityData}
			/>
		</div>
	</div>
));