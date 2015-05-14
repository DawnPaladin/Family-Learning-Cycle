/* global describe, it, assert, expect */

(function () {
	'use strict';

	describe("Check that variables can be seen", function() {
		it('should have the flcToy master object', function () {
			expect(flcToy).to.be.a('object');
		});
		it('should have flcToy.view', function () {
			expect(flcToy.view).to.be.a('object');
		});
		it('should have flcToy.view.canvas', function () {
			expect(flcToy.view.canvas).to.be.a('object');
		});
	});
})();
